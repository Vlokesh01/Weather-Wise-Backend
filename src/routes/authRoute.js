// src/routes/authRoutes.js
import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

// Step 1: Redirect to Google login page
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Handle callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = req.user.token;
    // Redirect frontend with JWT in URL
    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  }
);

export default router;
