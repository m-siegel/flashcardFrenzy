import express from "express";
import { checkAuthenticated } from "../util/check-auths.js";
import pathToPublicDir from "./pathToPublicDir.js";

var router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.sendFile("my-library.html", {
    root: pathToPublicDir,
  });
});

export default router;
