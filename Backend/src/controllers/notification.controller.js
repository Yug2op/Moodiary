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
    
    const targets = await User.find({
      notificationSubscription: { $ne: null }
    });

    // Send requests in parallel across users
    await Promise.all(
      targets.map(async (user) => {
        // Check if this specific user already logged their mood today
        const hasLoggedToday = user.lastMoodDate === todayStr;

        // Dynamic payload text based on their logging state
        const notificationPayload = JSON.stringify({
          title: hasLoggedToday ? "Mood Changed? 🔄" : "Log Your Mood! 🌸",
          body: hasLoggedToday 
            ? "Your energy levels can change throughout the day. Tap to quickly update your mood!"
            : "Keep your daily streak alive. Take 10 seconds to save your energy check-in.",
          icon: "/web-app-manifest-512x512.png",
        });

        try {
          await webpush.sendNotification(user.notificationSubscription, notificationPayload);
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Clean up expired or revoked permissions safely
            user.notificationSubscription = null;
            await user.save();
          } else {
            console.error(`Push delivery failure for user ${user._id}:`, err.message);
          }
        }
      })
    );

    return res.status(200).json({ 
      success: true, 
      message: `Processed and dispatched dynamic notifications to ${targets.length} targets.` 
    });
  } catch (error) {
    console.error("Cron Notification Error:", error);
    return res.status(500).json({ success: false });
  }
};