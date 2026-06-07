import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // ⚡ STEP 1: Grab the Authorization header instead of a cookie
    const authHeader = req.headers.authorization;
    console.log(authHeader)


    // The header format is: "Bearer <token_string>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Extract the raw token string from the split space array
    const token = authHeader.split(" ")[1];

    // ⚡ STEP 2: Verify using the exact Access Secret (matches your 15m token lifecycle)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token structure" });
    }

    // STEP 3: Grab user reference while keeping sensitive password hashes safely excluded
    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User workspace context not found" });
    }

    // Forward the verified mongoose document onto your subsequent controller endpoints
    req.user = user; 
    next();
  } catch (error) {
    // ⚡ IMPORTANT: Return a 401 on failure/expiration so your frontend Axios 
    // interceptor knows it needs to pause and spin the refresh token!
    return res.status(401).json({ 
      message: "Unauthorized - Token expired or invalid", 
      error: error.message 
    });
  }
};