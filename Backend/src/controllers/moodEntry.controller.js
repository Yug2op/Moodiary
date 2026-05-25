import { MoodEntry } from "../models/reaction.model.js";
import { User } from "../models/user.model.js";
import { getStartOfDay } from "../utils/getStartOfDay.js";


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

    // Get today's standardized date structure
    const todayDateObj = getStartOfDay();

    const userId = req.user._id;

    // Fetch user and existing daily mood log in parallel
    const [user, existingMood] = await Promise.all([
      User.findById(userId),
      MoodEntry.findOne({ user: userId, date: todayDateObj })
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
        date: todayDateObj,
      });

      message = "Mood added successfully";
      statusCode = 201;

    if (!user.lastMoodDate) {
      user.currentStreak = 1;
    } else {
      // 1. Normalize both dates into clean string shapes for exact structural comparison
      const lastMoodDateStr = new Date(user.lastMoodDate).toISOString().split('T')[0];
      const todayDateStr = new Date(todayDateObj).toISOString().split('T')[0];

      // 2. Build a fresh Date object based on today's midnight mark to subtract exactly 1 calendar day
      const yesterday = new Date(todayDateObj);
      yesterday.setDate(yesterday.getDate() - 1); // 🧠 Drops date back safely without breaking on month boundaries
      const yesterdayDateStr = yesterday.toISOString().split('T')[0];

      if (lastMoodDateStr === yesterdayDateStr) {
        user.currentStreak += 1;
      } else if (lastMoodDateStr === todayDateStr) {
        
      } else {

        user.currentStreak = 1;
      }
    }

    // Automatically check and push longestStreak benchmark up
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    // Store back to field as string representation
    user.lastMoodDate = todayDateObj;
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