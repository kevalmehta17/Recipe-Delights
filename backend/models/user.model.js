import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        maxLength: [30, "Username cannot exceed 30 characters"],
        minLength: [3, "Username must be at least 3 characters long"]
        
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"]
    },
    bio: {
        type: String,
        default: "Hey there! I love sharing recipes!🍳",
        maxLength: [150, "Bio cannot exceed 150 characters"]
    },
    lastLogin: {
        type: Date,
        default : Date.now,
    },
    savedRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    }]
}, { timestamps: true });

// pre-save hook to hash the password before saving to the db
userSchema.pre('save', async function (next)  {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.GEN_SALT_KEY));
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error("Error hashing password:-", error.message);
        next(error);
    }
})

// password checker method
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);        
    } catch (error) {
        console.error("Error matching password:-", error.message);
        throw error;
    }
}

const User = mongoose.model("User", userSchema);

export default User;