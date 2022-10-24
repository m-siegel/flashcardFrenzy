import express from "express";
import { checkAuthenticated } from "../util/check-auths.js";

var router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.render("/");
});

export default router;
