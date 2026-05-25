// routes/friend.routes.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
  getFriendsList,
  getSentRequests
} from "../controllers/friend.controller.js";

const router = express.Router();

// All friend management tasks require a valid active login token context
router.use(protectRoute);

router.post("/request", sendFriendRequest);                    // Send a request (Payload: { receiverId: "..." })
router.put("/request/:requestId", respondToFriendRequest);     // Respond (Payload: { action: "accepted" })
router.get("/requests/pending", getPendingRequests);           // List your pending incoming requests
router.get("/list", getFriendsList);    
router.get("/requests/sent", getSentRequests);                 // List your pending outgoing requests

export default router;