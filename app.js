import express from "express";
// import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";

import editDeckRouter from "./routes/edit-deck.js";
import exploreRouter from "./routes/explore.js";
import indexRouter from "./routes/index.js";
import loginRouter from "./routes/login.js";
import myLibraryRouter from "./routes/my-library.js";
import registerRouter from "./routes/register.js";
import studyRouter from "./routes/study.js";
import userSettingsRouter from "./routes/user-settings.js";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("./public"));

app.use("/edit-deck", editDeckRouter);
app.use("/explore", exploreRouter);
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/my-library", myLibraryRouter);
app.use("/register", registerRouter);
app.use("/study", studyRouter);
app.use("/user-settings", userSettingsRouter);

export default app;
