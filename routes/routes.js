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

// TODO -- understand
router.post("/logoutUser", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.json({ success: false, msg: "Error logging out.", err: err });
    }
    // Base on https://expressjs.com/en/resources/middleware/session.html
    req.session.user = null; // Destroy session
    req.session.manualData = null;
    req.session.save((err) => {
      // Save logout
      if (err) {
        res.json({
          success: false,
          msg: "Error saving logout.",
          err: err,
        });
      }
      req.session.regenerate((err) => {
        // Regenerate to guard against session fixation
        if (err) {
          res.json({
            success: false,
            msg: "Error regenerating session after logout.",
            err: err,
          });
        }
      });
    });
    res.json({
      success: true,
      msg: "Successfully logged out",
      err: null,
    });
  });
  res.json({
    success: true,
    msg: "Successfully logged out",
    err: null,
  });
});

export default router;
