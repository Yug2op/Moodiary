// controllers/feed.controller.js
import { MoodEntry } from "../models/reaction.model.js";
import { User } from "../models/user.model.js";
import { getStartOfDay } from "../utils/getStartOfDay.js";

export const getFriendsFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Parse pagination metrics safely with default fallbacks
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10)); // Max cap at 50 to prevent abuse
    const skip = (page - 1) * limit;

    // 2. Fetch ONLY the user's friends array (Lean query, no unnecessary data)
    const user = await User.findById(userId).select("friends").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User context not found." });
    }

    if (!user.friends || user.friends.length === 0) {
      return res.status(200).json({
        success: true,
        feed: [],
        pagination: { currentPage: page, hasNextPage: false, totalCount: 0 }
      });
    }

    // 3. Match your exact database string date format
    const databaseDateString = getStartOfDay();

    // 4. Construct the query filters
    const queryFilter = {
      user: { $in: user.friends },
      date: databaseDateString,
      isPrivate: false
    };

    // 5. Execute paginated query and total count calculation in parallel
    const [feed, totalCount] = await Promise.all([
      MoodEntry.find(queryFilter)
        .select("rating note emoji date createdAt") // 💡 Light payload optimization
        .populate("user", "username avatar currentStreak longestStreak")
        .populate("reactions", "emoji user")
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .lean(), 
      
      MoodEntry.countDocuments(queryFilter)
    ]);

    const hasNextPage = skip + feed.length < totalCount;

    return res.status(200).json({
      success: true,
      feed,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        hasNextPage
      }
    });

  } catch (error) {
    console.error("Fetch Scaled Feed Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};