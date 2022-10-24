import express from "express";
import passport from "passport";
import { checkNotAuthenticated } from "../util/check-auths.js";
// To get absolute path based on current location
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

var router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  res.sendFile("login.html", {
    // resolve() creates abs path to parent dir of login.html
    root: resolve(__dirname, "../public"),
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
