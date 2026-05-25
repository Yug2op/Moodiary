import { FriendRequest } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";

// 1. Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ success: false, message: "You cannot send a request to yourself." });
    }

    // Check if receiver exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ success: false, message: "You are already friends with this user." });
    }

    // Check if an existing request (any status) exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ success: false, message: "A pending request already exists between you." });
      }
      // If previously rejected, allow them to re-request by updating the status to pending
      if (existingRequest.status === "rejected" && existingRequest.sender.toString() === senderId.toString()) {
        existingRequest.status = "pending";
        await existingRequest.save();
        return res.status(200).json({ success: true, message: "Friend request sent again.", request: existingRequest });
      }
    }

    // Create fresh request
    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    return res.status(201).json({ success: true, message: "Friend request sent successfully.", request: newRequest });
  } catch (error) {
    console.error("Send Request Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 2. Accept or Reject Friend Request
export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; 
    const receiverId = req.user._id;

    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action type." });
    }

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found." });
    }

    // Validate that the user responding is the actual receiver
    if (request.receiver.toString() !== receiverId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to respond to this request." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: `This request was already ${request.status}.` });
    }

    request.status = action;
    request.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await request.save();


    if (action === "accepted") {
      await Promise.all([
        User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } }),
        User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } })
      ]);
    }

    return res.status(200).json({ success: true, message: `Friend request ${action} successfully.` });
  } catch (error) {
    console.error("Respond Request Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 3. Get Pending Requests for Current User
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "username phone avatar currentStreak"); // Hydrate basic profiles

    return res.status(200).json({ success: true, pendingRequests:requests }); 
  } catch (error) {
    console.error("Get Pending Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 4. Get Current User's Friend List
export const getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "username phone avatar currentStreak longestStreak"); // Pull active metadata

    return res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    console.error("Get Friends Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSentRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const sentRequests = await FriendRequest.find({
      sender: currentUserId,
      status: "pending"
    })
    .populate("receiver", "username email") 
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sentRequests.length,
      sendFriendRequest: sentRequests
    });

  } catch (err) {
    console.error("Error retrieving outgoing friend requests:", err);
    return res.status(500).json({
      success: false,
      message: "Server error processing outbound connection trace handles."
    });
  }
};