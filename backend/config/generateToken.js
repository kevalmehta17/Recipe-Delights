import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (user) => {
    return jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn : '1d'})
}

export default generateToken;