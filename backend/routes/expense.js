import express from "express";
import passport from "passport";
import { createExpense, getExpense, deleteExpense } from "../controllers/expense.js";
import { updateExpense, getData } from "../controllers/nonAdminStaff.js";
import { isLoggedIn } from "../middleware.js";
const router = express.Router();

// POST /expenses
router.post("/", isLoggedIn, createExpense); // working

// GET /expenses
router.get("/:id", isLoggedIn, getExpense); // working

// PUT /expenses/:id
router.put("/:id", isLoggedIn, updateExpense); // working

// DELETE /expenses/:id
router.delete("/:id", isLoggedIn, deleteExpense); // working


export default router;