/* Ilana-Mahmea */
import express from "express";
import passport from "passport";
import userConnect, {
  getUserById,
  addDeckToLibrary,
  addDeckCreated,
} from "../databaseConnect/userConnect.js";
import { availableUsername, createAndAddUser } from "../util/user-util.js";
import deckConnect from "../databaseConnect/deckConnect.js";

const router = express.Router();

/**
 * Responds indicating whether or not the session is valid (express-session and passport).
 */
router.post("/getAuthentication", (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

/**
 * Uses passport to authenticate that the user is logged in and redirects them accordingly
 */
router.post(
  "/loginUser",
  passport.authenticate("local", {
    successRedirect: "/loginSucceeded",
    failureRedirect: "/loginFailed",
  })
);

/**
 * Clears username and currentDeck data from req.session.manualData
 * Sends json object in the HTTP response with success and message fields in the body
 */
router.get("/loginFailed", (req, res) => {
  req.session.manualData = { username: "", currentDeck: "" };
  res.json({ success: false, msg: "Invalid username or password." });
});

/**
 * Initializes req.session.manualData username and currentDeck
 * Sends json object in the HTTP response with success and message fields in the body
 */
router.get("/loginSucceeded", async (req, res) => {
  req.session.manualData = { username: "", currentDeck: "" };
  const dbResponse = await getUserById(req.session.passport.user);
  if (dbResponse.success) {
    req.session.manualData.username = dbResponse.user.username;
  }
  res.json({ success: true, msg: "Successful login" });
});

/**
 * Sends json object in the HTTP response with value from session.manualData.username field
 */
router.post("/getUsername", (req, res) => {
  res.json({ username: req.session.manualData.username });
});

/**
 * Sends json object in the HTTP response with value from session.passport.user field
 */
router.post("/getUserId", (req, res) => {
  res.json({ user: req.session.passport.user });
});

/**
 * Sends json object in the HTTP response with value from session.manualData.currentDeck field
 */
router.post("/getCurrentDeck", (req, res) => {
  res.json({ currentDeck: req.session.manualData.currentDeck });
});

/**
 * Creates and adds user object if the provided username is available.
 * Expects json object in request body with username field.
 * Sends json object in the HTTP response with success and msg fields.
 */
router.post("/registerUser", async (req, res) => {
  if (await availableUsername(req.body.username)) {
    createAndAddUser(
      req.body.first_name,
      req.body.last_name,
      req.body.username,
      req.body.password
    );
    res.json({ success: true, msg: "Registration successful!" });
  } else {
    res.json({ success: false, msg: "Username unavailable. Try another." });
  }
});

/**
 * Logs out this session's user.
 * Sends json in HTTP response body with success, type, msg, errors and stage fields. The type
 * fild indicates which logout process attempts were successful (using passport or manually removing data
 * with express session alone). The stage field similarly indicates the stage at which a logout attempt failed.
 */
router.post("/logoutUser", (req, res) => {
  const body = {
    success: false,
    type: "req.logout()",
    msg: "logout init message",
    errors: [],
  };
  req.logout((err) => {
    if (err) {
      body.errors.push({
        stage: "req.logout()",
        msg: "Error with req.logout(). Attempting manual logout.",
        err: err,
      });
      body.type = "manual";
      // Try manual logout

      // Base on https://expressjs.com/en/resources/middleware/session.html
      req.session.passport = null; // Destroy session
      req.session.manualData = null;
      let e = false;
      req.session.save((err) => {
        // Save null variables
        if (err) {
          e = true;
          body.errors.push({
            stage: "manual logout - req.session.save()",
            msg: "Error saving deleted session. Attempting session regeneration.",
            err: err,
          });
        }
        req.session.regenerate((err) => {
          // Regenerate to guard against session fixation
          if (err) {
            e = true;
            body.errors.push({
              stage: "manual logout - req.session.regenerate()",
              msg: "Error regenerating session.",
              err: err,
            });
          }
        });
      });
      body.success = !e;
      if (!e) {
        body.msg =
          "Failed passport logout. Successful manual logout. See errors list.";
      } else {
        body.msg =
          "Failed passport logout. Failed manual logout. See errors list.";
      }
      return res.json(body);
    }

    body.success = true;
    body.msg = "Successful passport logout.";
    return res.json(body);
  });
});

/**
 * Expects HTTP request to have json body with attribute deckId.
 * Removes the specified deck from the user's library in the database.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/remove-deck-from-library", async (req, res) => {
  const deckId = req.body.deckId;
  const userId = req.session.passport.user;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot remove deck without deckId",
      err: null,
    });
  }

  let dbResponse = await userConnect.removeDeckFromLibrary(userId, deckId);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Expects HTTP request to have json body with attribute deckId.
 * Adds the specified deck to the user's library in the database.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/add-deck-to-library", async (req, res) => {
  const deckId = req.body.deckId;
  const userId = req.session.passport.user;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot add deck without deckId",
      err: null,
    });
  }
  let dbResponse = await userConnect.addDeckToLibrary(userId, deckId);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Expects HTTP request to have json body with attribute deckId.
 * Adds the specified deck to the user's decks_created array in the database.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/add-deck-to-created", async (req, res) => {
  const deckId = req.body.deckId;
  const userId = req.session.passport.user;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot add deck without deckId",
      err: null,
    });
  }
  let dbResponse = await userConnect.addDeckCreated(userId, deckId);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Gets the array of deck ids in the user's library.
 * Sends json in the HTTP response with success, msg, and err fields if can't connect to the database.
 * If connects to the database, forwards the userConnect.getDecksInLibrary response object in the HTTP response.
 */
router.get("/get-decks-in-user-library", async (req, res) => {
  const userId = req.session.passport.user;
  let dbResponse = await userConnect.getDecksInLibrary(userId);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json(dbResponse);
});

/**
 * Expects req body to be json and have a deckId field.
 * Calls deckConnect.updateDecPrivacy with the specified deckId.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/update-deck-privacy", async (req, res) => {
  const deckId = req.body.deckId;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot update deck without deckId",
      err: null,
    });
  }
  let dbResponse = await deckConnect.updateDeckPrivacy(deckId);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Expects req body to be json and have a deckId field and newName field.
 * Calls deckConnect.updateDeckName with the specified deckId and newName.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/update-deck-name", async (req, res) => {
  const deckId = req.body.deckId;
  const newName = req.body.newName;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot update deck without deckId",
      err: null,
    });
  }
  if (!newName) {
    return res.json({
      success: false,
      msg: "Cannot update deck without new name",
      err: null,
    });
  }
  let dbResponse = await deckConnect.updateDeckName(deckId, newName);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Sets the specified deck's tags to be the specified tags.
 * Expects req body to be json and have a deckId field and tagsArray field.
 * Calls deckConnect.updateDeckTags specified deckId and tags array.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/update-deck-tags", async (req, res) => {
  const deckId = req.body.deckId;
  const tagsArray = req.body.tagsArray;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot update deck tags without deckId",
      err: null,
    });
  }
  if (!tagsArray) {
    return res.json({
      success: false,
      msg: "Cannot update deck tags without tag array",
      err: null,
    });
  }
  let dbResponse = await deckConnect.updateDeckTags(deckId, tagsArray);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/**
 * Sets the specified deck's tags to the specified author username.
 * Expects req body to be json and have a deckId field and authorUsername field.
 * Calls deckConnect.updateDeckAuthor specified deckId and username array.
 * Sends json in the HTTP response with success, msg, and err fields.
 */
router.post("/update-deck-author", async (req, res) => {
  const deckId = req.body.deckId;
  const authorUsername = req.body.authorUsername;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot update deck author without deckId",
      err: null,
    });
  }
  if (!authorUsername) {
    return res.json({
      success: false,
      msg: "Cannot update deck author without new name",
      err: null,
    });
  }
  let dbResponse = await deckConnect.updateDeckAuthor(deckId, authorUsername);
  if (!dbResponse) {
    return res.json({
      success: false,
      msg: "Database error. No response from database.",
      err: new Error("No response from database"),
    });
  }
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

/** Armen */

/**
 * Gets an array of all public Deck objects trimmed down to only include their essential fields.
 * If successful, sends json object in the HTTP response with the Deck preview objects array
 * If unsuccessful, sends json object in the HTTP response with success and err fields
 */
router.get("/get-user-deck-previews", async (req, res) => {
  const userId = req.session.passport.user;
  const resObject = await deckConnect.getDecksInLibraryPreviews(userId);
  if (resObject.success) {
    return res.json({
      success: true,
      userDeckPreviews: resObject.userDeckPreviews,
    });
  } else {
    return res.json({ success: false, err: resObject.err });
  }
});

/**
 * Gets an array of all public Deck objects trimmed down to only include their essential fields.
 * If successful, sends json object in the HTTP response with the Deck preview objects array
 * If unsuccessful, sends json object in the HTTP response with success and err fields
 */
router.get("/get-public-deck-previews", async (req, res) => {
  const resObject = await deckConnect.getPublicDeckPreviews();
  if (resObject.success) {
    return res.json({
      success: true,
      publicDeckPreviews: resObject.publicDeckPreviews,
    });
  } else {
    return res.json({ success: false, err: resObject.err });
  }
});

/**
 * Saves the currently selected Deck's ID into session.manualData.currentDeck
 * Expects json object in request body with currentDeckId field
 * Sends json object in the HTTP response with a success field.
 * If successful, response includes currentDeckId field
 */
router.post("/set-current-deck", (req, res) => {
  const deckId = req.body.currentDeckId;
  if (deckId) {
    req.session.manualData.currentDeck = deckId;
    return res.json({
      success: true,
      currentDeckId: req.session.manualData.currentDeck,
    });
  } else {
    return res.json({ success: false });
  }
});

/**
 * Sends json object in the HTTP response with deckId obtained from session.manualData.currentDeck
 */
router.get("/get-current-deck-id", (req, res) => {
  const deckId = req.session.manualData.currentDeck;
  res.json({ deck: deckId });
});

/**
 * Removes user from a Deck's active_users array.
 * Sends json object in the HTTP response with a success field.
 * If unsuccessful, response includes err field with error received from deckConnect.deleteDeck
 */
router.post("/delete-user-from-deck", async (req, res) => {
  const responseObj = await deckConnect.deleteDeck(
    req.session.manualData.currentDeck,
    req.session.passport.user
  );
  if (!responseObj.success) {
    return res.json({ success: false, err: responseObj.err });
  }
  return res.json({ success: true });
});

/**
 * Adds user to a given Deck's active_users array.
 * Expects json object in request body with deckId field.
 * In the HTTP response, passes along the json object obtained from deckConnect.addUserToDeck
 */
router.post("/add-user-to-deck", async (req, res) => {
  const userId = req.session.passport.user;
  const deckId = req.body.deckId;
  const resObject = await deckConnect.addUserToDeck(deckId, userId);
  return res.json(resObject);
});

/**
 * Creates a duplicate deck from a given deck, and adds the new deck to user's library.
 * Replaces values of certain fields in the new deck, to separate it from the deck it was copied from.
 * Sends json object in the HTTP response with success field and deckToCopy field.
 */
router.post("/duplicate-deck", async (req, res) => {
  const resObject = await deckConnect.getDeckById(
    req.session.manualData.currentDeck
  );
  if (!resObject.success) {
    return res.json({ success: false, error: resObject.err });
  }
  const deckToCopy = resObject.deck;
  delete deckToCopy._id; //So mongodb will generate a new id
  deckToCopy.active_users = [];
  deckToCopy.active_users.push(req.session.passport.user);
  deckToCopy.authorId = req.session.passport.user;
  deckToCopy.authorId_chain.push(req.session.passport.user);
  deckToCopy.public = false;
  const currentDate = new Date();
  deckToCopy.date_created = currentDate;
  const authorObj = await userConnect.getUserById(req.session.passport.user);
  if (authorObj.success) {
    const author = authorObj.user.username;
    deckToCopy.author = author;
    deckToCopy.author_chain.push(author);
  }
  const response = await deckConnect.addDeckToDb(deckToCopy);
  if (response.success) {
    await addDeckToLibrary(req.session.passport.user, response.deckId);
    await addDeckCreated(req.session.passport.user, response.deckId);
    deckToCopy._id = response.deckId;
    return res.json({ success: true, deckToCopy: deckToCopy });
  }

  return res.json({ success: false, deckToCopy: null });
});

/**
 * Gets a Deck object by its ID.
 * Expects json object in request body with deckId field.
 * Sends json object in the HTTP response with a success field.
 * If successful, response object includes deck field containing the Deck object.
 * If unsuccessful, response object includes err field,
 * and passes along the error received from deckConnect.getDeckById
 */
router.post("/get-deck-by-id", async (req, res) => {
  const deckRes = await deckConnect.getDeckById(req.body.deckId);
  if (!deckRes.success) {
    return res.json({ success: false, err: deckRes.err });
  }
  return res.json({ success: true, deck: deckRes.deck });
});

/**
 * Creates a new deck and adds it to user's library.
 * Sends json object in the HTTP response with a success field.
 * If successful, response object includes deck field containing the Deck object.
 * If unsuccessful, response object includes err field,
 * and passes along the error received from deckConnect.createDeck
 */
router.get("/create-deck", async (req, res) => {
  const deckRes = await deckConnect.createDeck(req.session.passport.user);
  if (!deckRes.success) {
    return res.json({ success: false, err: deckRes.err });
  }
  const deckObj = deckRes.deck;
  const id = deckObj._id.toString();
  await addDeckToLibrary(id);
  await addDeckCreated(req.session.passport.user, id);
  return res.json({ success: true, deck: deckObj });
});

/**
 * Gets a deck's array of flashcards using the provided deck ID.
 * Expects json object in request body with deckId field.
 * Sends json object in the HTTP response containing success field.
 * If successful, response object includes flashcards field.
 * If not successful, response object includes err field,
 * and passes along the error received from deckConnect.getDeckById's response.
 */
router.post("/get-cards-in-deck", async (req, res) => {
  const deckRes = await deckConnect.getDeckById(req.body.deckId);
  if (!deckRes.success) {
    return res.json({ success: false, err: deckRes.err });
  }

  const flashcardArray = deckRes.deck.flashcards;
  return res.json({ success: true, flashcards: flashcardArray });
});

/**
 * Compares a user's answer to a flashcard prompt with the correct answers stored in the flashcard's answers list.
 * Expects json object in request body with answer field.
 * Sends json object in the HTTP response with success field.
 */
router.post("/check-answer", (req, res) => {
  let resString = req.body.answer;
  const correctAnswers = req.body.correctAnswers;

  if (
    correctAnswers.includes(resString) ||
    correctAnswers.includes(resString.toLowerCase())
  ) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

/**
 * Updates a user's username.
 * Expects json object in request body with newUsername field.
 * In the HTTP response, passes along the json object obtained from userConnect.updateUsername
 */
router.post("/change-username", async (req, res) => {
  const newName = req.body.newUsername;
  const resObject = await userConnect.updateUsername(
    req.session.passport.user,
    newName
  );
  return res.json(resObject);
});

/**
 * Deletes a user's account.
 * In the HTTP response, passes along the json object obtained from userConnect.deleteUser
 */
router.get("/delete-account", async (req, res) => {
  const resObject = await userConnect.deleteUser(req.session.passport.user);
  return res.json(resObject);
});

/**
 * Updates a deck's array of flashcards with a new array of flashcards.
 * Expects json object in request body with flashcardsArray field.
 * In the HTTP response, passes along the json object obtained from deckConnect.updateCardsList
 */
router.post("/update-deck-flashcards", async (req, res) => {
  const deckId = req.body.deckId;
  const flashcards = req.body.flashcardsArray;
  const resObject = await deckConnect.updateCardsList(deckId, flashcards);
  return res.json(resObject);
});

export default router;
