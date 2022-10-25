/*Armen Sarkisian and Ilana-Mahmea Siegel (pair programming) */
import express from "express";
import { checkNotAuthenticated } from "../util/check-auths.js";
import pathToPublicDir from "./pathToPublicDir.js";

const router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  res.sendFile("index.html", {
    root: pathToPublicDir,
  });
});

export default router;
