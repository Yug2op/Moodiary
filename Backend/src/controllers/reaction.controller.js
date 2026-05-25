// controllers/reaction.controller.js
import { MoodEntry } from "../models/reaction.model.js";
import { User } from "../models/user.model.js";

export const toggleMoodReaction = async (req, res) => {
  try {
    const { moodId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji || emoji.trim() === "") {
      return res.status(400).json({ success: false, message: "Emoji character is required." });
    }

    // 1. Fetch the targeted mood entry
    const moodEntry = await MoodEntry.findById(moodId);
    if (!moodEntry) {
      return res.status(404).json({ success: false, message: "Mood log entry not found." });
    }

    // 2. Enforce visibility rules (Cannot react to private logs)
    if (moodEntry.isPrivate) {
      return res.status(403).json({ success: false, message: "Access denied. This is a private log entry." });
    }

    // 3. Ensure the current user is actually a friend of the post creator (unless reacting to their own log)
    if (moodEntry.user.toString() !== userId.toString()) {
      const viewer = await User.findById(userId).select("friends");
      if (!viewer.friends.includes(moodEntry.user)) {
        return res.status(403).json({ success: false, message: "You can only react to your friends' posts." });
      }
    }

    // 4. Look for an existing reaction by this user on this specific entry
    const existingReactionIndex = moodEntry.reactions.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    let updatedMood;

    if (existingReactionIndex !== -1) {
      const currentEmoji = moodEntry.reactions[existingReactionIndex].emoji;

      if (currentEmoji === emoji) {
        // CASE A: User clicked the exact same emoji -> Remove it (Toggle off)
        updatedMood = await MoodEntry.findByIdAndUpdate(
          moodId,
          { $pull: { reactions: { user: userId } } },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          message: "Reaction removed successfully.",
          reactions: updatedMood.reactions,
        });
      } else {
        // CASE B: User clicked a different emoji -> Update it atomically
        // First pull the old one, then push the new one to prevent state duplication
        updatedMood = await MoodEntry.findByIdAndUpdate(
          moodId,
          { 
            $pull: { reactions: { user: userId } }
          },
          { new: true }
        );
        
        updatedMood = await MoodEntry.findByIdAndUpdate(
          moodId,
          { 
            $push: { reactions: { user: userId, emoji: emoji.trim() } } 
          },
          { new: true }
        ).populate("reactions.user", "username avatar");

        return res.status(200).json({
          success: true,
          message: "Reaction updated successfully.",
          reactions: updatedMood.reactions,
        });
      }
    }

    // CASE C: Fresh Reaction -> Simply push onto subdocument index
    updatedMood = await MoodEntry.findByIdAndUpdate(
      moodId,
      {
        $push: { reactions: { user: userId, emoji: emoji.trim() } }
      },
      { new: true }
    ).populate("reactions.user", "username avatar");

    return res.status(201).json({
      success: true,
      message: "Reaction added successfully.",
      reactions: updatedMood.reactions,
    });

  } catch (error) {
    console.error("Toggle Reaction Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};