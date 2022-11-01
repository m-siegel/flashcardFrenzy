/* Ilana-Mahmea */
import express from "express";
import passport from "passport";
import userConnect, {
  getUserById,
  addDeckToLibrary,
  removeDeckFromLibrary,
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

router.post(
  "/loginUser",
  passport.authenticate("local", {
    successRedirect: "/loginSucceeded",
    failureRedirect: "/loginFailed",
  })
);

router.get("/loginFailed", (req, res) => {
  req.session.manualData = { username: "", currentDeck: "" };
  res.json({ success: false, msg: "Invalid username or password." });
});

router.get("/loginSucceeded", async (req, res) => {
  req.session.manualData = { username: "", currentDeck: "" };
  const dbResponse = await getUserById(req.session.passport.user);
  if (dbResponse.success) {
    req.session.manualData.username = dbResponse.user.username;
  }
  res.json({ success: true, msg: "Successful login" });
});

router.post("/getUsername", (req, res) => {
  res.json({ username: req.session.manualData.username });
});

router.post("/getUserId", (req, res) => {
  res.json({ user: req.session.passport.user });
});

router.post("/getCurrentDeck", (req, res) => {
  res.json({ currentDeck: req.session.manualData.currentDeck });
});

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
  //const userId = "635db5ce21884bfba4a8c3ab";
  const resObject = await deckConnect.getDecksInLibraryPreviews(userId);
  console.log("the resObject: ", resObject);
  console.log("the resObject type: ", typeof resObject);
  if (resObject.success) {
    return res.json(resObject.userDeckPreviews);
  }
});

router.post("/set-current-deck", (req, res) => {
  const deckId = req.body.currentDeckId;
  console.log("req.body.currentDeckId: ", deckId);
  req.session.manualData.currentDeck = deckId;
  res.json({
    success: true,
    currentDeckId: req.session.manualData.currentDeck,
  });
});

router.post("/delete-user-from-deck", async (req, res) => {
  // console.log("req.body.deckId: ", req.session.manualData.currentDeck);
  // console.log("req.session.passport.user:", req.session.passport.user);
  await deckConnect.deleteDeck(
    req.session.manualData.currentDeck,
    req.session.passport.user
  );

  res.json({ success: false });
});

/**
 * Expects json body with attributes deckId and userId.
 */
router.post("/remove-deck-from-library", async (req, res) => {
  const deckId = req.body.deckId;
  //const deckId = req.session.manualData.currentDeck;
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
  //dbResponse = await dbResponse.json();
  return res.json({
    success: dbResponse.success,
    msg: dbResponse.msg,
    err: dbResponse.err,
  });
});

//TODO - add error handling
router.post("/duplicate-deck", async (req, res) => {
  const resObject = await deckConnect.getDeckById(
    req.session.manualData.currentDeck
  );
  const deckToCopy = resObject.deck;
  console.log("The deck to copy: ", deckToCopy);
  delete deckToCopy._id; //So mongodb will generate a new id
  deckToCopy.active_users.push(req.session.passport.user);
  const currentDate = new Date();
  deckToCopy.date_created = currentDate;
  await deckConnect.addDeckToDb(deckToCopy);
  const copiedDeck = await deckConnect.getDeckByDateCreated(currentDate);
  await addDeckToLibrary(copiedDeck._id);
  res.json({ success: true, duplicateDeck: copiedDeck });
});

router.post("/get-deck-by-id", async (req, res) => {
  const deckRes = await deckConnect.getDeckById(req.body.deckId);
  if (!deckRes.success) {
    res.json({ success: false, err: deckRes.err });
  }
  res.json({ success: true, deck: deckRes.deck });
});

router.get("/create-deck", async (req, res) => {
  const deckRes = await deckConnect.createDeck(req.session.passport.user);
  if (!deckRes.success) {
    res.json({ success: false, err: deckRes.err });
  }
  const deckObj = deckRes.deck;
  res.json({ success: true, deck: deckObj });
});

//add deck to library - expect req to have json with deckID and userID
//delete deck from library -e

export default router;
