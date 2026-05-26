// routes/analytics.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserAnalyticsSummary, last10Entries } from "../controllers/analytics.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/dashboard-summary", getUserAnalyticsSummary);
router.get("/lastUpdates", last10Entries);

export default router;