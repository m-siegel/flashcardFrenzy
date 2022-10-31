/* Ilana-Mahmea */
import express from "express";
import passport from "passport";
import { getUserById } from "../databaseConnect/userConnect.js";

const router = express.Router();

// TODO -- route all non-html to html

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

export default router;
