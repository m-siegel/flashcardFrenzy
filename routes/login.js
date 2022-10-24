import express from "express";
import passport from "passport";
import { checkNotAuthenticated } from "../util/check-auths";

var router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("/");
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
