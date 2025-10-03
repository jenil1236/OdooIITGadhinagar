import express from "express";
import passport from "passport";
import { signup, login, logout } from "../controllers/users.js";

const router = express.Router();

// POST /signup
router.post("/signup", signup);

// POST /login
router.post(
  "/login",
  passport.authenticate("local", { session: true }),
  login
);

// POST /logout
router.post("/logout", logout);

export default router;
