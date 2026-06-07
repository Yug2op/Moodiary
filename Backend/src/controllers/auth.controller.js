import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// ⚡ Security Matrix: Access tokens should be short-lived, Refresh tokens long-lived
const ACCESS_TOKEN_EXPIRY = "15m"; 
const REFRESH_TOKEN_EXPIRY = "30d";

// Helper utility to sign tokens and return them cleanly in an object
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ phone }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or phone already taken" });
    }

    const newUser = await User.create({ username, phone, password });

    const { accessToken, refreshToken } = generateTokens(newUser._id);
    
    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        currentStreak: user.currentStreak,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing. Please sign in again." });
    }

    // ⚡ FIX: Use linear verification. If it fails, it naturally triggers the catch block below.
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Generate fresh tokens
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    // Catch token expiration errors from jwt.verify explicitly and send a clean 403
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Refresh token expired or invalid." });
    }
    return res.status(500).json({ message: "Token rotation failed", error: error.message });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};