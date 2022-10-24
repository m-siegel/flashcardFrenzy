import express from "express";
import passport from "passport";
import { checkNotAuthenticated } from "../util/check-auths.js";
// To get absolute path based on current location
import pathToPublicDir from "./pathToPublicDir.js";

const router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  // Code source: https://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
  res.sendFile("login.html", {
    // resolve() creates abs path to parent dir of login.html
    root: pathToPublicDir,
  });
});

router.post(
  "/",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/my-library",
    failureRedirect: "/login",
    failureFlash: true, // TODO -- look into
  })
);

export default router;
