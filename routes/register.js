import express from "express";
import { checkNotAuthenticated } from "../util/check-auths.js";
import { availableUsername, createAndAddUser } from "../util/user-util.js";
// To get absolute path based on current location
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

var router = express.Router();

router.get("/", checkNotAuthenticated, (req, res) => {
  res.sendFile("register.html", {
    root: resolve(__dirname, "../public"),
  });
});

router.post(
  "/",
  checkNotAuthenticated,
  async (req, res, next) => {
    if (await availableUsername(req.body.username)) {
      next();
    } else {
      res.send({ message: "username already exists" });
    }
  },
  async (req, res) => {
    createAndAddUser(
      req.body.first_name,
      req.body.last_name,
      req.body.username,
      req.body.password
    );
    res.redirect(201, "/login"); // TODO - should we send the object, too?
  }
);

export default router;
