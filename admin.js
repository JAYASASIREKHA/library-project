import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminEmail, hashedPassword } from "../config/admin.js";

const router = express.Router();

// Admin login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if email matches admin email
    if (email !== adminEmail) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { email: adminEmail, isAdmin: true },
      process.env.JWT_SECRET || "your-secret-key"
    );

    res.json({
      token,
      user: {
        email: adminEmail,
        userType: "admin",
        isAdmin: true
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router; 