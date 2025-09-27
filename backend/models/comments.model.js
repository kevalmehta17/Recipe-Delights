import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    },
    text: {
        type: String,
        required: [true, "Comment text is required"],
        maxLength: [300, "Comment cannot exceed 300 characters"]
    }
}, {timestamps: true});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;