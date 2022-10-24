import express from "express";
import passport from "passport";
import { checkNotAuthenticated } from "../util/check-auths.js";

var router = express.Router();

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("l/ogin");
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/my-library",
    failureRedirect: "/login",
    failureFlash: true, // TODO -- look into
  })
);

export default router;
