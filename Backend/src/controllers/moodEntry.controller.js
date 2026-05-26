import { MoodEntry } from "../models/reaction.model.js";
import { User } from "../models/user.model.js";
// 🎯 FIX: Adjusted named import statement to grab the correct utility function token
import { getStandardizedToday } from "../utils/getStandardizedToday.js";

export const createOrUpdateMood = async (req, res) => {
  try {
    const { rating, note, emoji } = req.body;

    // 1. Core Validations
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 10",
      });
    }

    // 🎯 FIX: Retrieve today's standardized format string cleanly ("YYYY-MM-DD")
    const todayDateStr = getStandardizedToday();
    const userId = req.user._id;

    // Fetch user and existing daily mood log in parallel
    const [user, existingMood] = await Promise.all([
      User.findById(userId),
      MoodEntry.findOne({ user: userId, date: todayDateStr })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User context not found",
      });
    }

    let mood;
    let message = "";
    let statusCode = 200;

    if (existingMood) {
      // --- UPDATE EXISTING MOOD ---
      existingMood.rating = rating;
      existingMood.note = note ?? existingMood.note;
      existingMood.emoji = emoji ?? existingMood.emoji;

      mood = await existingMood.save();
      message = "Mood updated successfully";
      statusCode = 200;
    } else {
      // --- CREATE NEW MOOD ---
      mood = await MoodEntry.create({
        user: userId,
        rating,
        note: note || "",
        emoji: emoji || "",
        date: todayDateStr, // Always stores matching standardized schema expectations
      });

      message = "Mood added successfully";
      statusCode = 201;

      if (!user.lastMoodDate) {
        // First entry initializing the chain baseline
        user.currentStreak = 1;
      } else {
        // 🎯 FIX: Safely parse stored baseline strings without using raw .toISOString() mutation traps
        const lastMoodDateStr = user.lastMoodDate; // Already stored in database as "YYYY-MM-DD"

        // Calculate a safe calendar midpoint object matching your anchor day
        const currentAnchor = new Date(todayDateStr);
        
        // Subtract precisely 24 hours of timestamp duration values to establish calendar "yesterday"
        const yesterdayObj = new Date(currentAnchor.setDate(currentAnchor.getDate() - 1));
        
        const year = yesterdayObj.getFullYear();
        const month = String(yesterdayObj.getMonth() + 1).padStart(2, '0');
        const day = String(yesterdayObj.getDate()).padStart(2, '0');
        const yesterdayDateStr = `${year}-${month}-${day}`;

        // 🧠 Strict logic evaluation to check if streak advances, holds, or resets
        if (lastMoodDateStr === yesterdayDateStr) {
          user.currentStreak += 1;
        } else if (lastMoodDateStr === todayDateStr) {
          // If they are writing an unexpected entry or double-logging a clean stream, preserve current index
        } else {
          // If a calendar gap is detected, fallback safely to reset metrics anchor
          user.currentStreak = 1;
        }
      }

      // Automatically check and push longestStreak benchmark up
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }

      // Store back to field as string representation
      user.lastMoodDate = todayDateStr;
      await user.save();
    }

    return res.status(statusCode).json({
      success: true,
      message,
      mood,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });

  } catch (error) {
    console.error("Create/Update Mood Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};