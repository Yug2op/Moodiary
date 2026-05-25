import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Helper utility to sign tokens and drop them into an HTTP-Only cookie
const generateTokenAndSetCookie = (req, res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // Blocks JavaScript access (stops XSS)
    secure: process.env.NODE_ENV === "production", // Forces HTTPS in production
    sameSite: "strict", // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days in milliseconds
  });
};

export const signup = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ phone }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or phone already taken" });
    }

    // Create new user (password is automatically hashed via Mongoose pre-save hook)
    const newUser = await User.create({ username, phone, password });

    // Issue token and set cookie
    generateTokenAndSetCookie(req, res, newUser._id);

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.json({ message: "Signup failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Verify password using schema instance method
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Issue token and refresh cookie timeline
    generateTokenAndSetCookie(req, res, user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        currentStreak: user.currentStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookie instantly by setting maxAge to 0
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};