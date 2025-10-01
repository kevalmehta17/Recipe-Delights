import express from "express";
import  {protectRoute} from  "../middleware/auth.middleware.js";

const router = express.Router();

// public routes
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// protected Routers

router.post("/", protectRoute ,createRecipe);
router.put("/:id", protectRoute, updateRecipe);
router.delete("/:id", protectRoute, deleteRecipe);

router.get("/user/me", protectRoute, getMyRecipes);

router.put("/:id/like", protectRoute, likeRecipe);
router.put("/:id/save", protectRoute, saveRecipe);


export default router;