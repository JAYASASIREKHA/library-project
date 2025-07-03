import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Test route to create a user
router.post("/create-test-user", async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return res.json({ message: "Test user already exists", user: existingUser });
    }

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("test123", salt);

    const testUser = new User({
      userFullName: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      mobileNumber: 1234567890,
      userType: "student"
    });

    const savedUser = await testUser.save();
    console.log('Test user created successfully:', savedUser);
    res.status(201).json({ message: "Test user created successfully", user: savedUser });
  } catch (error) {
    console.error("Test user creation error:", error);
    res.status(500).json({ message: "Error creating test user", error: error.message });
  }
});

// Register route
router.post("/register", async (req, res) => {
  const { userFullName, admissionId, employeeId, email, password, mobileNumber, userType, gender, age, dob, address } = req.body;
  console.log('Registration attempt with data:', { userFullName, email, userType, mobileNumber, gender, age, dob });

  if (!userFullName || !email || !password || !mobileNumber || !userType || !gender || !age || !dob) {
    console.log('Missing required fields:', { userFullName, email, password, mobileNumber, userType, gender, age, dob });
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      userFullName,
      admissionId: userType === "Student" ? admissionId : "",
      employeeId: userType === "Staff" ? employeeId : "",
      email,
      password: hashedPassword,
      mobileNumber,
      userType,
      gender,
      age,
      dob,
      address: address || ""
    });

    const savedUser = await newUser.save();
    console.log('User registered successfully:', savedUser);

    res.status(201).json({ 
      message: "User registered successfully",
      user: savedUser // Return the full user object for confirmation
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or userFullName already exists" });
    }
    res.status(500).json({ 
      message: "Error adding member. Please try again.",
      error: error.message 
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: "No account found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log('Login successful for user:', email);

    res.json({
      token,
      user: {
        _id: user._id,
        userFullName: user.userFullName,
        email: user.email,
        userType: user.userType,
        isAdmin: user.isAdmin,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile
router.put("/update/:id", async (req, res) => {
  const { age, gender, dob, address } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { age, gender, dob, address } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// Get user by ID with populated transactions
router.get("/getuser/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("activeTransactions")
      .populate("prevTransactions");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// Get all members
router.get("/allmembers", async (req, res) => {
  try {
    const members = await User.find({ userType: { $in: ["Student", "Staff"] } })
      .select("-password") // Exclude password from response
      .populate("activeTransactions")
      .populate("prevTransactions");
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members", error: error.message });
  }
});

export default router;
