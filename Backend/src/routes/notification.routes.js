// routes/notification.routes.js
import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { saveSubscription, checkAndSendDailyNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.get("/cron-trigger", checkAndSendDailyNotifications); 

router.use(protectRoute);
router.post("/subscribe", saveSubscription); 

export default router;