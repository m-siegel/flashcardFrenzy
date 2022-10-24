import express from "express";
import { checkAuthenticated } from "../util/check-auths.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

var router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.sendFile("index.html", {
    root: resolve(__dirname, "../public"),
  });
});

export default router;
