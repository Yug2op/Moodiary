// routes/reaction.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleMoodReaction } from "../controllers/reaction.controller.js";

const router = express.Router();

// Protected toggle action: payload syntax -> POST /api/moods/react/6a12adf6... with { "emoji": "❤️" }
router.post("/react/:moodId", protectRoute, toggleMoodReaction);

export default router;