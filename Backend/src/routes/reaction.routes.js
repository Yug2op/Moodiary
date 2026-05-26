// routes/reaction.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleMoodReaction } from "../controllers/reaction.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/react/:moodId", toggleMoodReaction);

export default router;