import express from "express";
// import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import flash from "express-flash";
import session from "express-session";
import methodOverride from "method-override";
import passport from "passport";

import editDeckRouter from "./routes/edit-deck.js";
import exploreRouter from "./routes/explore.js";
import indexRouter from "./routes/index.js";
import loginRouter from "./routes/login.js";
import myLibraryRouter from "./routes/my-library.js";
import registerRouter from "./routes/register.js";
import studyRouter from "./routes/study.js";
import userSettingsRouter from "./routes/user-settings.js";
import logoutRouter from "./routes/logout.js";
// import welcomePRouter from "./routes/welcomeP.js";
// import homePRouter from "./routes/homeP.js";

import initializePassport from "./util/passport-config.js";
import {
  getUserByUsername,
  getUserById,
} from "./databaseConnect/userConnect.js";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// https://www.youtube.com/watch?v=-RCnNyD0L-s
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
initializePassport(passport, getUserByUsername, getUserById);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(cookieParser());
// This is needed to serve html pages with styling
// TODO -- figure out how to deal with .html
app.use(express.static("./public"));

app.use("/edit-deck", editDeckRouter);
app.use("/explore", exploreRouter);
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/my-library", myLibraryRouter);
app.use("/register", registerRouter);
app.use("/study", studyRouter);
app.use("/user-settings", userSettingsRouter);
// app.use("./welcome", welcomePRouter);
// app.use("./home", homePRouter);

app.use("/logout", logoutRouter);

export default app;
