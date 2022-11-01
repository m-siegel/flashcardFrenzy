/* Ilana-Mahmea */
import express from "express";
import passport from "passport";
import { getUserById } from "../databaseConnect/userConnect.js";
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
  req.session.manualData = { username: "" };
  res.json({ success: false, msg: "Invalid username or password." });
});

router.get("/loginSucceeded", async (req, res) => {
  req.session.manualData = { username: "" };
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

/** Armen */
// router.get("/my-library", (req, res) => {
//   if (req.session.passport.user) {
//     res.json({success: true});
//   }
// });

router.get("/get-user-deck-previews", async (req, res) => {
  // const userId = req.session.passport.user;
  const userId = "635db5ce21884bfba4a8c3ab";
  const resObject = await deckConnect.getDecksInLibraryPreviews(userId);
  console.log("the resObject: ", resObject);
  console.log("the resObject type: ", typeof resObject);
  if (resObject.success) {
    return res.json(resObject.userDeckPreviews);
  }
});

router.post("/save-current-deck", (req, res) => {
  const deckId = req.body;
  req.session.manualData.currentDeck = deckId;
  res.status();
});

//TESTAREA
router.get("/showSessionDeck", (req, res) => {
  res.json(req.session.manualData.currentDeck);
  console.log("Sending: ", res.session.manualData.currentDeck);
});

//ENDTESTAREA

export default router;
