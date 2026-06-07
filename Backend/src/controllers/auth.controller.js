import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Helper utility to sign tokens and drop them into an HTTP-Only cookie
const generateTokenAndSetCookie = (req, res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  })

  res.cookie("token", token, {
    httpOnly: true, // Blocks JavaScript access (stops XSS)
    secure: process.env.NODE_ENV === "production", // Forces HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days in milliseconds
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Blocks JavaScript access (stops XSS)
    secure: process.env.NODE_ENV === "production", // Forces HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Protects against CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days in milliseconds
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

export const refreshAccessToken = async (req, res) => {
  try {
    // Requires cookie-parser middleware to be active in server.js
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing. Please sign in again." });
    }

    // Verify token validity
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Refresh token expired or invalid." });
      }

      // Check if user still exists in DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found." });
      }

      // Generate a fresh short-lived access token
      const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      // Reset the access cookie 
      res.cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: ACCESS_COOKIE_MAX_AGE,
      });

      return res.status(200).json({ success: true, message: "Access token synchronized successfully." });
    });

  } catch (error) {
    return res.status(500).json({ message: "Token rotation failed", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Clears it immediately
      
      // ⚡ CRITICAL: These must match your generation script exactly to register the deletion
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0), // Clears it immediately
      
      // ⚡ CRITICAL: These must match your generation script exactly to register the deletion
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};