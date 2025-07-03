import express from 'express';
import User from "../models/User.js";
import Transaction from "../models/BookTransaction.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const users = [];

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

router.post('/register', (req, res) => {
    const { name, rollNo, email, password } = req.body;
    if (!name || !rollNo || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = users.find(user => user.email === email);
    if (existing) {
        return res.status(409).json({ message: 'User already exists' });
    }
    const newUser = { name, rollNo, email, password };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', user });
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

// Get user by ID
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

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Object.assign(user, updateData);
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Move transaction from active to previous
router.put("/:userId/transactions/:transactionId", async (req, res) => {
  try {
    const { userId, transactionId } = req.params;
    const { isAdmin } = req.body;

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from active transactions
    user.activeTransactions = user.activeTransactions.filter(
      id => id.toString() !== transactionId
    );

    // Add to previous transactions
    user.prevTransactions.push(transactionId);

    await user.save();
    res.json({ message: "Transaction moved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error moving transaction", error: error.message });
  }
});

// Upload profile photo
router.post("/uploadphoto/:id", upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's photo field with the file path
    user.photo = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: "Profile photo uploaded successfully",
      photo: user.photo
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading photo", error: error.message });
  }
});

// Update user profile photo with a URL
router.put("/updatephotourl/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ message: "Photo URL is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's photo field with the provided URL
    user.photo = photoUrl;
    await user.save();

    res.json({
      message: "Profile photo URL updated successfully",
      photo: user.photo
    });
  } catch (error) {
    console.error("Update photo URL error:", error);
    res.status(500).json({ message: "Error updating photo URL", error: error.message });
  }
});

export default router;
