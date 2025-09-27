import express from 'express';
import connectDB from './config/db.js';
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use(express.json());
const PORT = process.env.PORT || 8500;


app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB();
})
// 7uIdMsoEmC63dVhB
// mongodb+srv://kevalxcode28_db_user:7uIdMsoEmC63dVhB@cluster0.v05dr3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0