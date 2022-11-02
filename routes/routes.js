/* Ilana-Mahmea */
import express from "express";
import passport from "passport";
import userConnect, {
  getUserById,
  addDeckToLibrary,
  removeDeckFromLibrary,
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
 * Logs user
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
 * Expects json body with attributes deckId.
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
 * Expects json body with attributes deckId.
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
 * Expects json body with attributes deckId.
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

router.post("/add-card-to-deck", async (req, res) => {
  const deckId = req.body.deckId;
  const card = req.body.card;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot add card to deck without deckId",
      err: null,
    });
  }
  if (!card) {
    return res.json({
      success: false,
      msg: "Cannot add card to deck deck without card",
      err: null,
    });
  }
  let dbResponse = await deckConnect.addCardToDeck(deckId, card);
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

router.post("/remove-card-from-deck", async (req, res) => {
  const deckId = req.body.deckId;
  const cardId = req.body.cardId;
  if (!deckId) {
    return res.json({
      success: false,
      msg: "Cannot remove card from deck without deckId",
      err: null,
    });
  }
  if (!cardId) {
    return res.json({
      success: false,
      msg: "Cannot remove card from deck without card id",
      err: null,
    });
  }
  let dbResponse = await deckConnect.removeCardFromDeck(deckId, cardId);
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

router.get("/get-user-deck-previews", async (req, res) => {
  const userId = req.session.passport.user;
  const resObject = await deckConnect.getDecksInLibraryPreviews(userId);
  if (resObject.success) {
    return res.json(resObject.userDeckPreviews);
  } else {
    return res.json({ success: false, err: resObject.err });
  }
});

router.get("/get-public-deck-previews", async (req, res) => {
  const resObject = await deckConnect.getPublicDeckPreviews();
  if (resObject.success) {
    return res.json(resObject.publicDeckPreviews);
  } else {
    return res.json({ success: false, err: resObject.err });
  }
});

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

router.post("/add-user-to-deck", async (req, res) => {
  const userId = req.session.passport.user;
  const deckId = req.body.deckId;
  const resObject = await deckConnect.addUserToDeck(deckId, userId);
  return res.json(resObject);
});

/**
 * Expects json body with attributes deckId and userId.
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
  if (!userId) {
    return res.json({
      success: false,
      msg: "Cannot remove deck without userId",
      err: null,
    });
  }
  let dbResponse = await removeDeckFromLibrary(userId, deckId);
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

router.post("/get-deck-by-id", async (req, res) => {
  const deckRes = await deckConnect.getDeckById(req.body.deckId);
  if (!deckRes.success) {
    return res.json({ success: false, err: deckRes.err });
  }
  return res.json({ success: true, deck: deckRes.deck });
});

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

router.post("/get-cards-in-deck", async (req, res) => {
  const deckRes = await deckConnect.getDeckById(req.body.deckId);
  if (!deckRes.success) {
    return res.json({ success: false, err: deckRes.err });
  }

  const flashcardArray = deckRes.deck.flashcards;
  return res.json({ success: true, flashcards: flashcardArray });
});

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

router.post("/change-username", async (req, res) => {
  const newName = req.body.newUsername;
  const resObject = await userConnect.updateUsername(
    req.session.passport.user,
    newName
  );
  console.log("The resObject from router");
  return res.json(resObject);
});

router.get("/delete-account", async (req, res) => {
  const resObject = await userConnect.deleteUser(req.session.passport.user);
  return res.json(resObject);
});

router.post("/update-deck-flashcards", async (req, res) => {
  const deckId = req.body.deckId;
  const flashcards = req.body.flashcardsArray;
  const resObject = await deckConnect.updateCardsList(deckId, flashcards);
  return res.json(resObject);
});

router.get("/get-current-deck-id", (req, res) => {
  const deckId = req.session.manualData.currentDeck;
  res.json({ deck: deckId });
});

export default router;
