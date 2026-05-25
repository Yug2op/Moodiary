import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Grid"))
  .catch((err) => console.error("DB Connection Error:", err));

// Route Registration
app.get("/api/health", (req, res) => {
  console.log("Health check requested: ");
  console.log("Health is good!");
  

  res.send({ status: "ok" });
}); 
import authRoutes from "./src/routes/auth.routes.js";
import moodEntryRoutes from "./src/routes/moodEntry.routes.js";
import friendRoutes from "./src/routes/friend.routes.js";
import feedRoutes from "./src/routes/feed.routes.js";
import reactionRoutes from "./src/routes/reaction.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import searchUsersRoutes from "./src/routes/searchUsers.routes.js";


app.use("/api/auth", authRoutes);
app.use("/api/mood", moodEntryRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchUsersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));