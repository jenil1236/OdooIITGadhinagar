import express from "express";
import passport from "passport";
import { signup, login, logout } from "../controllers/user.js";

const router = express.Router();

// POST /signup
router.post("/signup", signup);

// POST /login
router.post("/login", login);

// POST /logout
router.post("/logout", logout);

// Google login
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    // At this point, req.user is set by Passport
    const user = req.user;

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }
);

export default router;
