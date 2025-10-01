import generateToken from "../config/generateToken.js";
import User from "../models/user.model.js";


export const Signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // find the user exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({message: "User Already Exists"});
        }
        // create new user
        const newUser = await User.create({
            username,
            email,
            password
        })
        // generate token 
        const token = generateToken(newUser);
        // const { password: pwd, ...userWithoutPassword } = newUser._doc;
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...newUser._doc,
                token
            }
        })

    } catch (error) {
        console.error("Error during signup:", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({message : "All fields are required"});
        }
        // find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        // verify the password
        const isPasswordMatch = await user.matchPassword(password);
        if(!isPasswordMatch) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        // generate token if password matches
        const token = generateToken(user);
        user.lastLogin = Date.now();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                ...user._doc,
                token
            }
        })
    } catch (error) {
        console.error("Error during Login", error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
 }

export const Logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};


