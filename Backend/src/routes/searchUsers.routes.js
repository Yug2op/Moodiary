import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { searchUsers, suggestedUsers } from "../controllers/searchUsers.controller.js";

const router = express.Router();

router.use(protectRoute); // Secure all endpoints below

router.get("/searchUser", searchUsers);        // GET /api/search/searchUser?query=yugank
router.get("/suggestedUsers", suggestedUsers)
export default router;
