import mongoose from "mongoose";

const BookCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("BookCategory", BookCategorySchema);
