import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req, res, next) => { 
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({message: "Not authorized, no token"});
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({message: "Not authorized, no token"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.id;
        next();
        
    } catch (error) {
        console.error('JWT Error:- ', error.message);
        return res.status(401).json({message: "Not authorized, token failed"});
    }
}