import express from "express";
import passport from "passport";
import { createExpense, getExpenses, updateExpense, deleteExpense } from "../controllers/expense.js";

const router = express.Router();

// POST /expenses
router.post("/", passport.authenticate("jwt", { session: false }), createExpense);

// GET /expenses
router.get("/", passport.authenticate("jwt", { session: false }), getExpenses);

// PUT /expenses/:id
router.put("/:id", passport.authenticate("jwt", { session: false }), updateExpense);

// DELETE /expenses/:id
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteExpense);
export default router;