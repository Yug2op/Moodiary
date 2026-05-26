// controllers/notification.controller.js
import webpush from "web-push";
import { User } from "../models/user.model.js";
import { getStandardizedToday } from "../utils/getStandardizedToday.js";

// Initialize VAPID encryption
webpush.setVapidDetails(
  "mailto:your-mr.yugank.2000@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { notificationSubscription: subscription });
    
    return res.status(200).json({ success: true, message: "Device subscription successfully linked." });
  } catch (error) {
    console.error("Save Subscription Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkAndSendDailyNotifications = async (req, res) => {
  try {
    const todayStr = getStandardizedToday();
    
    // Find users who have enabled notifications BUT haven't updated their mood log date today
    const targets = await User.find({
      notificationSubscription: { $ne: null },
      lastMoodDate: { $ne: todayStr }
    });

    const notificationPayload = JSON.stringify({
      title: "Log Your Mood! 🌸",
      body: "Keep your daily streak alive. Take 10 seconds to save your energy check-in.",
      icon: "/web-app-manifest-192x192.png", // Path to your frontend public folder asset logo
    });

    // Send requests in parallel across users
    await Promise.all(
      targets.map(user => 
        webpush.sendNotification(user.notificationSubscription, notificationPayload)
          .catch(err => {
            if (err.statusCode === 410) {
              // User uninstalled PWA or revoked permission, clean up database record safely
              user.notificationSubscription = null;
              return user.save();
            }
            console.error("Push delivery failure dropped line:", err.message);
          })
      )
    );

    return res.status(200).json({ success: true, message: `Dispatched logs to ${targets.length} targets.` });
  } catch (error) {
    console.error("Cron Notification Error:", error);
    return res.status(500).json({ success: false });
  }
};