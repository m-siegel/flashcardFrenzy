/** By Ilana-Mahmea */

import * as mongodb from "mongodb";

// Wanted to create connection uri here, but it wouldn't work unless we assigned it inside of each function
// const uri = process.env.DB_URI || "mongodb://localhost:27017";

const userConnect = {};
const databaseName = "MainDatabase";

const collectionName = "Users";
userConnect.databaseName = databaseName;
userConnect.collectionName = collectionName;

/**
 * Adds the given user object to the users collection.
 * @param {object} userObj    A user object.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       insertedId: the string representation of the ObjectId of the inserted user or "",
 *                       err: null or the error that was caught}
 */
export async function addUser(userObj) {
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.insertOne(userObj);
    if (res.acknowledged) {
      return {
        success: true,
        msg: "Successfully added user.",
        insertedId: res.insertedId.toString(),
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not add user. Please try again later.",
      insertedId: "",
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "An error occurred while adding user.",
      insertedId: "",
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.addUser = addUser;

/**
 * @param {string} idString   String version of user's _id mongodb.ObjectId in the MongoDB collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       user: object corresponding to id or null if user could not be found,
 *                       err: null or the error that was caught}
 */
export async function getUserById(idString) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    // ESLint says this is prefered behavior.
    // Return will be suspended until finally is executed.
    const res = await usersCollection.findOne({ _id: id });
    if (res) {
      return { success: true, msg: "User found.", user: res, err: null };
    }
    return { success: false, msg: "User not found.", user: null, err: null };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "An error occurred", user: null, err: e };
  } finally {
    await client.close();
  }
}
userConnect.getUserById = getUserById;

/**
 * @param {string} username   The user's username.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       user: object corresponding to id or null if user could not be found,
 *                       err: null or the error that was caught}
 */
export async function getUserByUsername(username) {
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.findOne({ username: username });
    if (res) {
      return { success: true, msg: "User found.", user: res, err: null };
    }
    return { success: false, msg: "User not found.", user: null, err: null };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "An error occurred", user: null, err: e };
  } finally {
    await client.close();
  }
}
userConnect.getUserByUsername = getUserByUsername;

/**
 * Returns the list of deck IDs in the user's library.
 * @param {string} idString   String version of user's _id mongodb.ObjectId in the MongoDB collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       deckIds: Array of string versions of the mongodb.ObjectIds for each deck in the user's library.
 *                       err: null or the error that was caught}
 */
export async function getDecksInLibrary(idString) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const user = await usersCollection.findOne({ _id: id });
    if (user) {
      return {
        success: true,
        msg: "Found user.",
        deckIds: user.decks_in_library,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not find user.",
      deckIds: [],
      err: null,
    };
  } catch (e) {
    console.error(e);
    return { success: false, msg: "An error occurred.", deckIds: [], err: e };
  } finally {
    await client.close();
  }
}
userConnect.getDecksInLibrary = getDecksInLibrary;

/**
 * Sets the user's decks_in_library list to match the parameter array.
 * @param {string} idString    String version of user's _id mongodb.ObjectId in the MongoDB collection.
 * @param {array} newDecksList   Array of deck Ids for decks in the user's library.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       decksList: the parameter newDecksList
 *                       err: null or the error that was caught}
 */
export async function updateDecks(idString, newDecksList) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.updateOne(
      { _id: id },
      { $set: { decks_in_library: newDecksList } }
    );
    if (res.acknowledged && res.matchedCount) {
      return {
        success: true,
        msg: "Updated decks in user's library",
        decksList: newDecksList,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not update decks in user's library",
      decksList: newDecksList,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error updating decks in user's library",
      decksList: newDecksList,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.updateDecks = updateDecks;

/**
 * Pushes the parameter deckId into the user's decks_in_library array.
 * @param {string} idString    String version of user's _id mongodb.ObjectId in the MongoDB Users collection.
 * @param {string} deckId   String version of deck's _id mongodb.ObjectId in the MongoDB Decks collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       deck: the parameter deckId
 *                       err: null or the error that was caught}
 */
export async function addDeckToLibrary(idString, deckId) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.updateOne(
      { _id: id },
      { $push: { decks_in_library: deckId } }
    );
    if (res.acknowledged && res.matchedCount) {
      return {
        success: true,
        msg: "Inserted deck into user's library",
        deckId: deckId,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not insert deck into user's library",
      deckId: deckId,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error inserting deck into user's library",
      deckId: deckId,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.addDeckToLibrary = addDeckToLibrary;

/**
 * Removes the parameter deckId into the user's decks_in_library array.
 * @param {string} idString    String version of user's _id mongodb.ObjectId in the MongoDB Users collection.
 * @param {string} deckId   String version of deck's _id mongodb.ObjectId in the MongoDB Decks collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       deck: the parameter deckId
 *                       err: null or the error that was caught}
 */
export async function removeDeckFromLibrary(idString, deckId) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.updateOne(
      { _id: id },
      { $pull: { decks_in_library: deckId } }
    );
    if (res.acknowledged && res.matchedCount) {
      return {
        success: true,
        msg: "Removed deck from user's library",
        deckId: deckId,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not remove deck from user's library",
      deckId: deckId,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error removing deck from user's library",
      deckId: deckId,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.removeDeckFromLibrary = removeDeckFromLibrary;

/**
 * Pushes the parameter deckId into the user's decks_created array.
 * @param {string} idString    String version of user's _id mongodb.ObjectId in the MongoDB Users collection.
 * @param {string} deckId   String version of deck's _id mongodb.ObjectId in the MongoDB Decks collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       deck: the parameter deckId
 *                       err: null or the error that was caught}
 */
export async function addDeckCreated(idString, deckId) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);
    const res = await usersCollection.updateOne(
      { _id: id },
      { $push: { decks_created: deckId } }
    );
    if (res.acknowledged && res.matchedCount) {
      return {
        success: true,
        msg: "Inserted deck into user's list of decks created",
        deckId: deckId,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not insert deck into user's list of decks created",
      deckId: deckId,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error inserting deck into user's list of decks created",
      deckId: deckId,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.addDeckCreated = addDeckCreated;

/**
 * Sets the user's username list to the parameter username if the parameter username is available.
 * @param {string} idString    String version of user's _id mongodb.ObjectId in the MongoDB collection.
 * @param {string} newUsername   String to set the user's username to.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       username: the user's username after the attempted update.
 *                       err: null or the error that was caught}
 */
export async function updateUsername(idString, newUsername) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);
  let oldUsername = "";

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);

    const user = await usersCollection.findOne({ _id: id });
    if (!user) {
      return {
        success: false,
        msg: "Could not find user",
        username: "",
        err: null,
      };
    }
    oldUsername = user.username;

    // Check if valid username
    if (await usersCollection.findOne({ username: newUsername })) {
      return {
        success: false,
        msg: `Username '${newUsername}' already exists.`,
        username: oldUsername,
        err: null,
      };
    }
    // Update username
    const res = await usersCollection.updateOne(
      { _id: id },
      { $set: { username: newUsername } }
    );
    if (res.acknowledged && res.matchedCount) {
      return {
        success: true,
        msg: "Successfully updated username.",
        username: newUsername,
        err: null,
      };
    }
    return {
      success: false,
      msg: "Could not update username.",
      username: oldUsername,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error updating username.",
      username: oldUsername,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.updateUsername = updateUsername;

/**
 * Removes the user from the database.
 * @param {id} idString   String version of user's _id mongodb.ObjectId in the MongoDB collection.
 * @returns {object}    {success: boolean,
 *                       msg: string explaining success status,
 *                       userId: string of the ObjectId of the user who was deleted.
 *                       err: null or the error that was caught}
 */
export async function deleteUser(idString) {
  const id = new mongodb.ObjectId(idString);
  const uri = process.env.DB_URI || "mongodb://localhost:27017";
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db(databaseName);
    const usersCollection = mainDatabase.collection(collectionName);

    const res = await usersCollection.deleteOne({ _id: id });
    if (res.acknowledged) {
      if (res.deletedCount) {
        return {
          success: true,
          msg: "Successfully deleted user.",
          userId: idString,
          err: null,
        };
      } else {
        return {
          success: false,
          msg: "Could not find user to delete.",
          userId: idString,
          err: null,
        };
      }
    }
    return {
      success: false,
      msg: "Could not delete user.",
      userId: idString,
      err: null,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      msg: "Error deleting user",
      userId: idString,
      err: e,
    };
  } finally {
    await client.close();
  }
}
userConnect.deleteUser = deleteUser;

export default userConnect;
