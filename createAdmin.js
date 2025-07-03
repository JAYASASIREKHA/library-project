import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const MONGO_URI = "mongodb://localhost:27017/library"; // Change if your DB URI is different

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = "admin@admin.com";
  const password = "admin@123"; // Change to your desired password

  // Check if admin already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new User({
    userFullName: "Admin",
    email,
    password: hashedPassword,
    userType: "admin",
    isAdmin: true,
    mobileNumber: 1234567890
  });

  await admin.save();
  console.log("Admin user created!");
  process.exit();
}

createAdmin(); 