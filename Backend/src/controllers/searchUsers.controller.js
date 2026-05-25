// controllers/userDiscovery.controller.js
import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query; // e.g., ?query=yugank
    const currentUserId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    // 1. Find matching users (case-insensitive regex match on username or phone)
    const matchedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Don't return the logged-in user
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { phone: { $regex: query, $options: "i" } }
          ]
        }
      ]
    })
    .select("username phone avatar currentStreak")
    .limit(20)
    .lean();

    if (matchedUsers.length === 0) {
      return res.status(200).json({ success: true, users: [] });
    }

    // 2. Fetch all active friend requests involving the current user to compute state mappings
    const matchedUserIds = matchedUsers.map(u => u._id);
    const activeRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, receiver: { $in: matchedUserIds } },
        { sender: { $in: matchedUserIds }, receiver: currentUserId }
      ]
    }).lean();

    // 3. Build a fast lookup map for statuses
    const requestMap = new Map();
    activeRequests.forEach(reqObj => {
      const key = `${reqObj.sender.toString()}_${reqObj.receiver.toString()}`;
      requestMap.set(key, reqObj.status);
    });

    // 4. Map friendship statuses cleanly onto the user payload arrays
    const formattedUsers = matchedUsers.map(user => {
      let relationshipStatus = "stranger";
      
      const outgoingKey = `${currentUserId.toString()}_${user._id.toString()}`;
      const incomingKey = `${user._id.toString()}_${currentUserId.toString()}`;

      if (requestMap.has(outgoingKey)) {
        const status = requestMap.get(outgoingKey);
        relationshipStatus = status === "pending" ? "pending_sent" : status; // 'accepted' or 'rejected'
      } else if (requestMap.has(incomingKey)) {
        const status = requestMap.get(incomingKey);
        relationshipStatus = status === "pending" ? "pending_received" : status;
      }

      // If they are explicitly in the current user's friends list array
      if (req.user.friends && req.user.friends.includes(user._id)) {
        relationshipStatus = "friends";
      }

      return {
        ...user,
        relationshipStatus
      };
    });

    return res.status(200).json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error("Search Users Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const suggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const friendsList = req.user.friends || [];
    const suggestedUsers = await User.find({
      _id: { 
        $ne: currentUserId,      
        $nin: friendsList        
      }
    })
    .select("username phone avatar currentStreak")
    .limit(10)
    .lean();

    return res.status(200).json({ success: true, users: suggestedUsers });
  } catch (error) {
    console.error("Suggested Users Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

