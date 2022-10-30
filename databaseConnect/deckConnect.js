import * as mongodb from "mongodb";

function DeckConnect() {
  const deckConnect = {};
  const deckCollection = "Decks";
  const userCollection = "Users";

  /*
  Adds a given Deck object to the Deck Collection.
  Parameters: a Deck object (containing all fields except _id)
  Returns: Object containing success boolean and message string
  */
  deckConnect.addDeckToDb = async function(deckObj) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection).insertOne(deckObj);
      return {success: true, msg: "Successfully added Deck to database."};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error adding Deck to database.", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Removes a Deck from a user's library. Specifically, removes the deck ID from User.decks_in_library, and
  removes the user ID from Deck.active_users. If the Deck's number of active users drops to zero, then permanently
  deletes it from the database.
  Parameters: the ID of the deck to be removed, and the ID of the user whose library to remove it from
  Returns: Object containing success boolean and message string
  */
  deckConnect.deleteDeck = async function(deckId, userId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    const userIdObj = new mongodb.ObjectId(userId);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      //remove user from deck's list of active user's
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {$pull:{active_users: userId}});
      //remove deck from user's list of decks in library
      await mainDatabase.collection(userCollection)
        .updateOne({_id: userIdObj}, {$pull: {decks_in_library: deckId}});
      const deckObj = await mainDatabase.collection(deckCollection).findOne({_id: deckIdObj});
      //using .aggregate and $size, get an object which has the length of deck's active_users array
      //https://www.tutorialspoint.com/count-the-number-of-items-in-an-array-in-mongodb
      //const getLength = await mainDatabase.collection(deckCollection).aggregate({$project:{"array_length":{$size: "active_users"}}});
      //if no other active users, then safely delete it from the database
      if (deckObj.active_users.length === 0) {
        await mainDatabase.collection(deckCollection).deleteOne({_id:deckIdObj});
      }
      return {success: true, msg: "Succesfully removed Deck"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error removing Deck", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Gets the list of active users for a particular Deck.
  Parameters: ID of the deck
  Returns: Object with 3 fields: success boolean, message string, and active_users (array of user IDs)
  */
  deckConnect.getDeckUsers = async function(deckId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const deckObject = await mainDatabase.collection(deckCollection).findOne({_id: deckIdObj});
      const deckUserList = deckObject.active_users;
      const resObject = {success: true, msg: "Successfully retrieved Deck's active user list", active_users: deckUserList};
      return resObject;
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error getting Deck's user list", err: e};
    } finally {
      await client.close();
    }

  };

  /*
  Creates a new Deck for a user. Fills in properties with default values, and stores the new Deck in the Deck Collection.
  Adds the new Deck to the user's decks_in_library.
  Parameters: ID of the user who is creating a Deck.
  Returns: Object with 3 fields: success boolean, message string, and deck (the newly created deck object)

  */
  deckConnect.createDeck = async function(userId) {
    const newDeck = {};
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const userIdObj = new mongodb.ObjectId(userId);
    const currentDate = new Date();
    newDeck.name = "";
    newDeck.date_created = currentDate;
    newDeck.flashcards = [];
    newDeck.public = false;
    newDeck.deck_tags = [];
    newDeck.description = ""; //for future use
    newDeck.deck_stats = {}; //for future use
    newDeck.success_indicators = {}; //for future use
    newDeck.card_tag_settings = {}; //for future use
    newDeck.authorId = userId;
    newDeck.last_modified = new Date();

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const userObject = await mainDatabase.collection(userCollection).findOne({_id: userIdObj});
      const deckAuthor = userObject.username;
      newDeck.author = deckAuthor;
      newDeck.author_chain = [deckAuthor];
      newDeck.authorId_chain = [userId];
      newDeck.active_users = [userId];
      await mainDatabase.collection(deckCollection).insertOne(newDeck);
      //we don't know the new deck's id yet, so query it by current date
      const deckObj = await mainDatabase.collection(deckCollection).findOne({date_created: currentDate});
      console.log(deckObj);
      const deckId = deckObj._id.toString();
      await mainDatabase.collection(userCollection)
        .updateOne({_id: userIdObj}, {$push: {decks_in_library: deckId}});
      return {success: true, msg: "New Deck successfully added to database.", deck: newDeck};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error creating new deck.", err: e};
    } finally {
      await client.close();
    }

  };


  /*
  Gets a Deck object queried from the database by its ID.
  Parameters: the ID of the deck to be retrieved
  Returns: Object containing 3 fields: success boolean, message string, and deck (the deck object)
  */
  deckConnect.getDeckById = async function(deckId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const deckObj = await mainDatabase.collection(deckCollection).findOne({_id: deckIdObj});
      return {success: true, msg: "Successfully retrieved Deck", deck: deckObj};

    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error retrieving Deck", err: e};
    } finally {
      await client.close();
    }

  };
  /*
  Gets a "preview" of all the public decks in the Deck collection. Each Deck preview object contains only a few essential Deck attributes.
  Parameters: None
  Returns: Object with 3 fields: success boolean, message string, and publicDeckPreviews (array of deck preview objects)
  */
  deckConnect.getPublicDeckPreviews = async function() {
    const previews = [];
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const decksCursor = await mainDatabase.collection(deckCollection)
        .find({public: true}, {projection: {name: 1, author: 1, deck_tags: 1, _id: 1}});
      await decksCursor.forEach((deck) => {
        deck._id = deck._id.toString();
        previews.push(deck);
      });
      await decksCursor.close();
      return {success: true, msg: "Successfully retrieved public deck previews", publicDeckPreviews: previews};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error getting public deck previews", err: e};
    } finally {
      await client.close();
    }

  };

  /*Gets all the Decks in a user's library.
  Parameters: ID of the user whose decks to retrieve
  Returns: Object with 3 fields: success boolean, message string, and userDecks(array of deck IDs)
  */
  deckConnect.getDecksByUser = async function(userId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const decksArray = [];

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const decksCursor = await mainDatabase.collection(deckCollection)
        .find({active_users: userId});
      await decksCursor.forEach((deck) => {
        deck._id = deck._id.toString();
        decksArray.push(deck);
      });
      await decksCursor.close();
      return {success: true, msg: "Successfully retrieved user's decks", userDecks: decksArray};

    } catch(e) {
      console.error(e);
      return {success: false, msg: "Error getting decks", err: e};
    } finally {
      await client.close();
    }
  };


  /*
  Gets a Deck's list of flashcard objects.
  Parameters: ID of the deck whose flashcards are being requested
  Returns: Object containing 3 fields: success boolean, message string, and flashcards (array of Card objects)
  */
  deckConnect.getFlashcardsFromDeck = async function(deckId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const cardsArray = await mainDatabase.findOne({_id: deckIdObj}).flashcards;
      return {success: true, msg: "Successfully retrieved Deck's flashcards list", flashcards: cardsArray};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to get flashcards list", err: e};
    } finally {
      await client.close();
    }

  };


  /*
  Gets previews of all the decks in the user's library. Each Deck preview object contains only a few essential Deck attributes.
  Parameters: ID of the user whose deck previews are being retrieved
  Returns: Object with 3 fields: success boolean, message string, and userDeckPreviews (array of deck preview objects)
  */
  deckConnect.getDecksInLibraryPreviews = async function(userId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const previews = [];

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const decksCursor = await mainDatabase.collection(deckCollection)
        .find({active_users: userId}, 
          {projection: {name: 1, author: 1, deck_tags: 1, _id: 1}});
      await decksCursor.forEach((deck) => {
        deck._id = deck._id.toString();
        previews.push(deck);
      });
      const cursor = await decksCursor.toArray();
      console.log(cursor);
      await decksCursor.close();
      return {success: true, msg: "Successfully retrieved user deck previews", userDeckPreviews: previews};

    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error retrieving user deck previews", err: e};
    } finally {
      await client.close();
    }

  };


  /*Updating functions part 1: User-defined updates*/

  /*
  Changes a Deck from public to private or private to public.
  Parameters: ID of the Deck to update
  Returns: Object containing success boolean and string message
  */
  deckConnect.updateDeckPrivacy = async function(deckId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      const isPublic = await mainDatabase.collection(deckCollection).findOne({_id: deckIdObj}).public;
      if (isPublic) {
        await mainDatabase.collection(deckCollection)
          .updateOne({_id: deckIdObj}, {public: false});
      } else {
        await mainDatabase.collection(deckCollection)
          .updateOne({_id: deckIdObj}, {public: true});
      }
      return {success: true, msg: "Succesfully changed Deck's privacy setting."};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update Deck's privacy setting", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Updates a Deck's name.
  Parameters: ID of the deck to be updated, new name string
  Returns: Object containing success boolean and string message
  */
  deckConnect.updateDeckName = async function(deckId, newName) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {name: newName});
      return {success: true, msg: "Successfully updated Deck name"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update Deck name", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Adds a new Card to the specified Deck.
  Parameters: ID of the deck to be updated, Card object to be added to the deck
  Returns: Object containing 3 fields: success boolean, message string, and modifiedDeck(the modified deck object)
  */
  deckConnect.addCardToDeck = async function(deckId, cardObj) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection).updateOne({_id: deckIdObj}, {$push: {flashcards:cardObj}});
      const deck = await mainDatabase.collection(deckCollection).findOne({_id: deckIdObj});
      return {success: true, msg: "Successfully added card to Deck", modifiedDeck: deck};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Error adding flashcard to deck", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Removes a particular Card from the specified Deck.
  Parameters: ID of the deck to be updated, ID of the flashcard to be removed
  Returns: Object containing success boolean and message string
  */
  deckConnect.removeCardFromDeck = async function(deckId, cardId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collectionName(deckCollection)
        .updateOne({_id: deckIdObj}, {$pull: {flashcards: {id: cardId}}});
      return {success: true, msg: "Successfully removed flashcard from Deck"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to remove card from Deck.", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Replaces a Deck's existing array of Deck Tags with an updated array of new Deck Tags.
  Parameters: ID of the deck to be updated, array of deck tag strings
  Returns: Object containing success boolean and message string
  */
  deckConnect.updateDeckTags = async function(deckId, newTagsArray) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {deck_tags: newTagsArray});
      return {success: true, msg: "Successfully updated Deck Tags."};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update Deck Tags", err: e};
    } finally {
      await client.close();
    }
  };

  /*Updating functions part 2: Internal updating functions*/

  /*
  Updates a Deck's author. If a user ever changes their username, this function will be called on each Deck in their library.
  Parameters: ID of the deck to be updated, new author string
  Returns: Object containing success boolean and message string
  */
  deckConnect.updateDeckAuthor = async function(deckId, newAuthorStr) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {author: newAuthorStr});
      return {success: true, msg: "Succesfully changed Deck's author"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update Deck author", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Updates a Deck's last_modified field. Anytime a user edits one of their existing Decks, this function will be called.
  Parameters: ID of the deck to be updated, Date object representing the date/time the Deck was being edited
  Returns: Object containing success boolean and message string
  */
  deckConnect.updateLastModified = async function(deckId, date) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {last_modified: date});
      return {success: true, msg: "Succesfully updated Deck's last modification date"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update Deck's last modification date", err: e};
    } finally {
      await client.close();
    }
  };

  /*
  Updates a Deck's author chain. Appends user ID to its author_Id_chain, and appends username to its author_chain
  Parameters: ID of deck to be updated, ID of user who is the latest author of the Deck
  Returns: Object containing success boolean and message string
  */
  deckConnect.addToAuthorChain = async function(deckId, authorId) {
    const uri = process.env.DB_URI || "mongodb://localhost:27017";
    const client = new mongodb.MongoClient(uri);
    const deckIdObj = new mongodb.ObjectId(deckId);
    const userIdObj = new mongodb.ObjectId(authorId);

    try {
      await client.connect();
      const mainDatabase = await client.db("MainDatabase");
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {$push: {authorId_chain: authorId}});
      const username = await mainDatabase.collection(userCollection)
        .findOne({_id: userIdObj}).username;
      await mainDatabase.collection(deckCollection)
        .updateOne({_id: deckIdObj}, {$push: {author_chain: username}});
      return {success: true, msg: "Successfully updated author chain"};
    } catch (e) {
      console.error(e);
      return {success: false, msg: "Failed to update author chain", err: e};
    } finally {
      await client.close();
    }

  };



  return deckConnect;
}



export default DeckConnect();
