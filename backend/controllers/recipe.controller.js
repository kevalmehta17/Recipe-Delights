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
        const recipes = await Recipe.find(filter).populate("createdBy", "username bio").sort({ createdAt: -1 });
        
        if (recipes.length === 0) {
            return res.status(404).json({message: "No recipes found currently"});
        }
        res.status(200).json({recipes});
        
    } catch (error) {
        console.error("Error in getAllRecipes:-", error.message);
        res.status(500).json({message: "Server Error"});
    }
}

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid recipe id"});
        }

        const recipe = await Recipe.findById(id).populate("createdBy", "username bio");
        if (!recipe) {
            return res.status(404).json({message: "Recipe not found"});
        }
        res.status(200).json({recipe});

    } catch (error) {
        console.error("Error in getRecipeById:- ", error.message);
        res.status(500).json({message: "Server Error"});
    }
}

export const createRecipe = async (req, res) => {
    try {
        // get the data from req.body
        const { title, description, ingredients, instructions, type, mealType, imageUrl } = req.body;

        // validate the data
        const requiredFields = { title, description, ingredients, instructions, type, mealType, imageUrl };
        const missingFields = [];
        for (const field in requiredFields) {
            if (!requiredFields[field]) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            return res.status(400).json({message: `Missing required fields:- ${missingFields.join(", ")}`});
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
            createdBy: req.user
        });
        await newRecipe.save();
        res.status(201).json({message: "Recipe created successfully", recipe: newRecipe});
        
    } catch (error) {
        console.error("Error in createRecipe:-", error.message);
        res.status(500).json({message: "Server Error"});
    }
}

// update recipe - protected
export const updatedRecipe = async (req, res) => {
    try {
            const { id } = req.params;
            const { imageUrl, ...otherData } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({message: "Invalid recipe id"});
            }
            // fetch the recipe from db
            const recipe = await Recipe.findById(id);
            if (!recipe) {
                return res.status(404).json({message: "Recipe not found"});
            }
            // check if the logged in user is the creator of the recipe
            if (req.user !== recipe.createdBy.toString()) {
                return res.status(403).json({message: "You are not authorized to update this recipe"});
            }
            // prepare the updated data
            let updatedData = { ...otherData };
            
            // handle the image update
            if (imageUrl) {
                if (imageUrl.startsWith("data:image/")) {
                    try {
                        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                            folder: "recipe-delights"
                        })
                        updatedData.imageUrl = uploadResponse.secure_url;
                        
                    } catch (error) {
                        console.error("Error uploading image to Cloudinary:-", error.message);
                        return res.status(500).json({message: "Image upload failed"});
                    }
                }
            }
            // update the recipe
            const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true });
            res.status(200).json({message: "Recipe updated successfully", recipe: updatedRecipe});
        } catch (error) {
            console.error("Error in updatedRecipe:-", error.message);
            res.status(500).json({message: "Server Error"});
    }
}

export const deleteRecipe = async (req, res) => { 
    try {
        const { id } = req.params;
        // find the id in db
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid recipe id"});
        }
        // find the recipe in db
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({message: "Recipe not found"});
        }
        // check if the logged in user is the creator of the recipe
        if (req.user !== recipe.createdBy.toString()) {
            return res.status(403).json({message: "You are not authorized to delete this recipe"});
        } 
    //         {
    //   "public_id": "recipe-delights/abc123",
    //   "secure_url": "https://res.cloudinary.com/.../recipe-delights/abc123.png"
    // }

        // delete image from the cloudinary 
        if (recipe.imageUrl && recipe.imageUrl.includes("cloudinary.com")) {
            // extract the publicId
            const publicId = recipe.imageUrl.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`recipe-delights/${publicId}`);
            } catch (error) {
                console.error("Cloudinary image clean error:-", error.message);
                res.status(500).json({ message: error.message });
            }
        }
        // delete the recipe from db 
        await Recipe.findByIdAndDelete(id);
        res.status(200).json({message: "Recipe deleted successfully"});
        
    } catch (error) {
        console.error("Error in deleteRecipe:- ", error.message);
        res.status(500).json({message: "Server Error"});
    }
}