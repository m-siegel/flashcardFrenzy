import express from "express";
import { checkNotAuthenticated } from "../util/check-auths.js";
import pathToPublicDir from "./pathToPublicDir.js";

var router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  res.sendFile("index.html", {
    root: pathToPublicDir,
  });
});

export default router;
