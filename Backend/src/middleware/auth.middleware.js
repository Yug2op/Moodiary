import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(410).json({ message: `Unauthorized - No token provided ${req.cookies} ${req}` });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(410).json({ message: "Unauthorized - Invalid token structure" });
    }

    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User workspace context not found" });
    }

    req.user = user; 
    next();
  } catch (error) {
    res.status(410).json({ message: "Authentication internal error", error: error.message });
  }
};