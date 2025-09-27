import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log("MongoDB URI:", process.env.MONGO_URI); // Debugging line

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
export default connectDB;