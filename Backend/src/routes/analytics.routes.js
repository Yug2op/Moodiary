// routes/analytics.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserAnalyticsSummary, last10Entries } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard-summary", protectRoute, getUserAnalyticsSummary);
router.get("/lastUpdates", protectRoute, last10Entries);

export default router;