import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const MONGO_URI = "mongodb://localhost:27017/library";

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = "admin@admin.com";
  const password = "admin@123"; // Permanent admin password

  // Check if admin already exists
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists in admin collection.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new Admin({
    email,
    password: hashedPassword
  });

  await admin.save();
  console.log("Permanent admin user created in admin collection!");
  process.exit();
}

createAdmin(); 