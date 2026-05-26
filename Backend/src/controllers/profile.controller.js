// controllers/profile.controller.js
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getStandardizedToday } from "../utils/getStandardizedToday.js";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;
    const updates = {};

    // 1. Process Username changes exactly as before...
    if (username && username.trim() !== req.user.username) {
      const processedUsername = username.trim().toLowerCase();
      if (processedUsername.length < 4) {
        return res.status(400).json({ success: false, message: "Username must be at least 4 characters." });
      }
      const existingUser = await User.findOne({ username: processedUsername });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username is already taken." });
      }
      updates.username = processedUsername;
    }

    // 2. 💡 Handle Server-Side Image Buffer Processing via Cloudinary Stream
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "moodiary_avatars",
        transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }] // Automatically crop tightly onto faces
      });

      updates.avatar = uploadResponse.secure_url; // Override target key with high-performance link string
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid changes provided." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "username avatar currentStreak");

    if (!user) {
      return res.status(404).json({ success: false, message: "User context not found" });
    }

    const todayStr = getStandardizedToday();

    // ⚡ STREAK TIMEOUT CHECK
    if (user.lastMoodDate && user.lastMoodDate !== todayStr) {
      // Calculate calendar "yesterday" cleanly without mutating instances
      const todayDateObj = new Date(todayStr);
      todayDateObj.setDate(todayDateObj.getDate() - 1);
      
      // Formats the date object perfectly back to your standardized format: "YYYY-MM-DD"
      const yesterdayStr = todayDateObj.toISOString().split("T")[0];

      // 🎯 If their last entry isn't today AND isn't yesterday, drop the streak back to 0 proactively
      if (user.lastMoodDate !== yesterdayStr && user.currentStreak !== 0) {
        user.currentStreak = 0; 
        await user.save();
      }
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Profile Streak Verification Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};