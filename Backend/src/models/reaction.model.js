import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { 
    _id: false 
  }
);

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "A mood scale rating is required"],
      min: [1, "Rating cannot be lower than 1"],
      max: [10, "Rating cannot be higher than 10"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Notes are capped at 500 characters for optimal feed density"],
      default: "",
    },
    emoji: {
      type: String, 
      required: [true, "A primary mood emoji is required"],
    },
    reactions: [reactionSchema],
    date: {
      type: String, 
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true,
  }
);

moodEntrySchema.index({ user: 1, date: 1, isPrivate: 1 }, { unique: true });

moodEntrySchema.index({ date: -1 });

export const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);