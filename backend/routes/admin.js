import express from "express";
import { getAllUsers,updateApprovalSettings } from "../controllers/admin.js";
import {isLoggedIn} from "../middleware.js";

const router = express.Router();

router.get("/all",isLoggedIn,getAllUsers);

router.put("/new",isLoggedIn,updateApprovalSettings);

export default router;