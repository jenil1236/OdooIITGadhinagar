import express from "express";
import {getData, updateExpense} from "../controllers/nonAdminStaff.js";

const router = express.Router();
// /staff/getData
router.get("/getData", getData);
// /staff/updateExpense/:id
router.put("/updateExpense/:id", updateExpense);

export default router;