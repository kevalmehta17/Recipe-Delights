import Recipe from "../models/recipe.model.js";

// get all recipes - public
export const getAllRecipes = async (req, res) => {
    try {
        // extract the user requirement from the query params
        // GET /api/recipes?type=Veg&mealType=Dinner
        const { type, mealType } = req.query;
        // build the filter obj that is help to filter the recipes
        let filter = {};
        if (type) {
            filter.type = type;
        }
        if (mealType) {
            filter.mealType = mealType;
        }
        // fetch all from db if no filter is applied otherwise apply the filter
        const recipes = await Recipe.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });
        
        if (recipes.length === 0) {
            return res.status(404).json({message: "No recipes found currently"});
        }
        res.status(200).json({recipes});
        
    } catch (error) {
        console.error("Error in getAllRecipes:-", error.message);
        res.status(500).json({message: "Server Error"});
    }
}

export const createRecipe = async (req, res) => {
    try {
        // get the data from req.body
        const { title, description, ingredients, instructions, type, mealType, imageUrl } = req.body;
        // validate the data
        if (!title || !description || !ingredients || !instructions || !type || !mealType || !imageUrl) {
            return res.status(400).json({message: "All fields are required"});
        }
        //handle the image upload to cloudinary
        let finalImageUrl = imageUrl;
        if (imageUrl) {
            if (imageUrl.startsWith("data:image/")) { 
                try {
                    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                        folder: "recipe-delights"
                    });
                    finalImageUrl = uploadResponse.secure_url;
                } catch (error) {
                    console.error("Error uploading image to Cloudinary:-", error.message);
                    return res.status(500).json({message: "Image upload failed"});
                }
            }
        }
        // create a new recipe
        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            instructions,
            type,
            mealType,
            imageUrl: finalImageUrl,
            createdBy: req.user._id
        });
        await newRecipe.save();
        res.status(201).json({message: "Recipe created successfully", recipe: newRecipe});
        
    } catch (error) {
        console.error("Error in createRecipe:-", error.message);
        res.status(500).json({message: "Server Error"});
    }
}