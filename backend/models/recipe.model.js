import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Recipe title is required"],
        trim: true,
        maxLength: [100, "Recipe title cannot exceed 100 characters"]
    },
    description: {
        type: String,
        required: [true, "Recipe description is required"],
        trim: true,
        maxLength: [1000, "Recipe description cannot exceed 500 characters"]
    },
    ingredients: {
        type: [String], //array of strings
        required: [true, "Ingredients are required"],
    },
    instructions: {
        type: [String],
        required: [true, "Instructions are required"],
    },
    type: {
        type: String,
        enum: ["Veg", "Non-Veg"],
        required: [true, "Recipe type is required"]
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"],
        required: [true, "Meal type is required"]
    },
    imageUrl: {
        type: String, // cloudinary imageUrl
        required: [true, "Recipe image is required"],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;