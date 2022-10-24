// USE LATER

import express from "express";
import { checkNotAuthenticated } from "../util/check-auths.js";
import loginRouter from "login.js";

var router = express.Router();

// /* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

router.get("/:page", checkNotAuthenticated, (req, res) => {
  res.render("/" + req.params.page);
});

router.use("/login", loginRouter);

router.post("/:page", checkNotAuthenticated, (req, res) => {
  switch (req.params.page) {
    case "login":
      loginRouter(req, res);
      break;
    case "register":
      break;
    default:
  }
});

export default router;
