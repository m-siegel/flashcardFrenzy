/*Armen Sarkisian and Ilana-Mahmea Siegel (pair programming) */
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import mainRouter from "./routes/routes.js";
import initializePassport from "./util/passport-config.js";
import {
  getUserByUsername,
  getUserById,
} from "./databaseConnect/userConnect.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToPublicDir = resolve(__dirname, "./public");

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// https://www.youtube.com/watch?v=-RCnNyD0L-s
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
app.use(cookieParser());
// This is needed to serve html pages with styling
app.use(express.static(pathToPublicDir));
app.use("/", mainRouter);

export default app;
