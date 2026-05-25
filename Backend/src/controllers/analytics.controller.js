// controllers/analytics.controller.js
import { MoodEntry } from "../models/reaction.model.js";
import { User } from "../models/user.model.js";

export const getUserAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Establish Date Ranges
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); 
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 2. Execute Stats Aggregation in Parallel
    const [averages, yearlyLogs, userProfile] = await Promise.all([
      // Pipeline A: Calculate rolling 7-day and 30-day averages dynamically
      MoodEntry.aggregate([
        { $match: { user: userId } },
        {
          $facet: {
            weekly: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ],
            monthly: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ]
          }
        }
      ]),

      // Pipeline B: Fetch all entries for the current year to build the GitHub contribution grid
      MoodEntry.find({
        user: userId,
        createdAt: { $gte: startOfYear }
      })
      .select("rating note emoji date createdAt")
      .sort({ createdAt: 1 })
      .lean(),

      // Pipeline C: Grab streak benchmarks
      User.findById(userId).select("currentStreak longestStreak").lean()
    ]);

    // 3. Format Extracted Average Summaries safely
    const weeklyAvg = averages[0]?.weekly[0]?.avgRating 
      ? parseFloat(averages[0].weekly[0].avgRating.toFixed(1)) 
      : 0;
      
    const monthlyAvg = averages[0]?.monthly[0]?.avgRating 
      ? parseFloat(averages[0].monthly[0].avgRating.toFixed(1)) 
      : 0;

    // 4. Generate the Comprehensive GitHub-Style Contribution Grid Matrix
    // Maps calendar dates to either a logged mood payload or an empty structural box
    const contributionGrid = [];
    const dateCursor = new Date(startOfYear);

    // Create a fast-lookup map out of our database results
    const logsMap = new Map();
    yearlyLogs.forEach((log) => {
      // Extract the standard short string key representation (YYYY-MM-DD or via your timestamp conversion utility)
      const logDateString = new Date(log.createdAt).toDateString();
      logsMap.set(logDateString, log);
    });

    // Step through every calendar day from Jan 1st up to today
    while (dateCursor <= today) {
      const currentCursorKey = dateCursor.toDateString();
      const matchingLog = logsMap.get(currentCursorKey);

      const year = dateCursor.getFullYear();
      const month = String(dateCursor.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(dateCursor.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      contributionGrid.push({
        date: localDateString, // Formats cleanly to "YYYY-MM-DD"
        hasLogged: !!matchingLog,
        // If a log exists for this specific day, dump full context details
        moodDetails: matchingLog ? {
          rating: matchingLog.rating,
          note: matchingLog.note,
          emoji: matchingLog.emoji,
          createdAt: matchingLog.createdAt
        } : null
      });

      // Advance cursor day forward by 1
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    return res.status(200).json({
      success: true,
      summary: {
        weeklyAverage: weeklyAvg,
        monthlyAverage: monthlyAvg,
        currentStreak: userProfile?.currentStreak || 0,
        longestStreak: userProfile?.longestStreak || 0
      },
      contributionGrid // 💡 Array containing every calendar block with full details
    });

  } catch (error) {
    console.error("Fetch Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const last10Entries = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Fetch the 10 most recent chronological updates logged by this user identity
    const entries = await MoodEntry.find({ user: user._id })
      .sort({ date: -1, createdAt: -1 }) // Sort by explicit logged date first, then entry timestamp
      .limit(10)
      .lean(); // Converts Mongoose Documents to plain objects for faster serialization performance

    // 2. Return a unified payload structural match for your profile frontend elements
    return res.status(200).json({ 
      success: true, 
      history: entries // 💡 CRITICAL FIX: Renamed from "entries" to "history" to match data.history inside ProfilePage.jsx
    });

  } catch (error) {
    console.error("Fetch Last 10 Entries Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};