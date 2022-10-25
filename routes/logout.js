/*Armen Sarkisian and Ilana-Mahmea Siegel (pair programming) */
import express from "express";

const router = express.Router();

router.delete("/", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

export default router;
