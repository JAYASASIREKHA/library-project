import express from "express";
import BookCategory from "../models/BookCategory.js"; // make sure this model exists

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await BookCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});

export default router;
