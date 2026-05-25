import express from "express";
import { createOrUpdateMood } from "../controllers/moodEntry.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createOrUpdateMood);

export default router;