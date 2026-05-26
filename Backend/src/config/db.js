import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!connString) {
      console.error("❌ Error: MONGO_URI environment variable is missing!");
      process.exit(1);
    }

    // Connect directly to the database instance
    const conn = await mongoose.connect(connString);
    
    console.log(`🚀 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Exit the server process with a failure code if the database connection fails
    process.exit(1); 
  }
};

export default connectDB;