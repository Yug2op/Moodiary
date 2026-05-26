import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";

// Route Imports (Moved to the top)
import authRoutes from "./src/routes/auth.routes.js";
import moodEntryRoutes from "./src/routes/moodEntry.routes.js";
import friendRoutes from "./src/routes/friend.routes.js";
import feedRoutes from "./src/routes/feed.routes.js";
import reactionRoutes from "./src/routes/reaction.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import searchUsersRoutes from "./src/routes/searchUsers.routes.js";


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
// NOTE: Serverless environments spin up/down frequently. 
// Mongoose caches connections natively, but ensure your URI is stable.
connectDB();

// Route Registration
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grid API | Active</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0a0a0a;
                color: #eaeaea;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                overflow: hidden;
            }
            .card {
                text-align: center;
                padding: 2.5rem;
                background: #121212;
                border: 1px solid #222;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                max-width: 400px;
                width: 90%;
            }
            .pulse-container {
                display: flex;
                justify-content: center;
                margin-bottom: 1.5rem;
            }
            .pulse {
                width: 14px;
                height: 14px;
                background-color: #00ff66;
                border-radius: 50%;
                box-shadow: 0 0 0 0 rgba(0, 255, 102, 0.7);
                animation: pulsing 1.6s infinite;
            }
            h1 {
                font-size: 1.8rem;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 0.5rem;
                letter-spacing: -0.5px;
            }
            p {
                color: #888;
                font-size: 0.95rem;
                margin-bottom: 1.5rem;
            }
            .badge {
                display: inline-block;
                background: #1c1c1e;
                border: 1px solid #2c2c2e;
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                font-family: monospace;
                font-size: 0.85rem;
                color: #00ff66;
            }
            @keyframes pulsing {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 102, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(0, 255, 102, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 102, 0); }
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="pulse-container">
                <div class="pulse"></div>
            </div>
            <h1>Grid Production API</h1>
            <p>The backend services are running smoothly on Vercel.</p>
            <div class="badge">STATUS: OPERATIONAL</div>
        </div>
    </body>
    </html>
  `);
});

app.use("/api/auth", authRoutes);
app.use("/api/mood", moodEntryRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchUsersRoutes);

// CRITICAL FOR VERCEL: Only listen if not running in a serverless environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// CRITICAL FOR VERCEL: Export the app instance
export default app;