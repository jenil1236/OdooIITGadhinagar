import express from "express";
import passport from "passport";
import { createExpense, getExpense, updateExpense, deleteExpense } from "../controllers/expense.js";
import { isLoggedIn } from "../middleware.js";
const router = express.Router();

// POST /expenses
router.post("/", isLoggedIn, createExpense);

// GET /expenses
router.get("/", isLoggedIn, getExpense);

// PUT /expenses/:id
router.put("/:id", isLoggedIn, updateExpense);

// DELETE /expenses/:id
router.delete("/:id", isLoggedIn, deleteExpense);
export default router;