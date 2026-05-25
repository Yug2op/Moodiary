import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: function (value) {
          return this.sender ? this.sender.toString() !== value.toString() : true;
        },
        message: "You cannot send a friend request to yourself.",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "{VALUE} is not a valid request status",
      },
      default: "pending",
      lowercase: true,
    },
    expiresAt: {
      type: Date,
      default: null, 
    }
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
friendRequestSchema.index({ receiver: 1, status: 1 });

export const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);