import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFriendsFeed } from "../controllers/feed.controller.js";

const router = express.Router();

// Secure route - requires active user context
router.get("/friends-today", protectRoute, getFriendsFeed);

export default router;