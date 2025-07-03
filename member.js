import express from 'express';
import Member from '../models/member.js';

const router = express.Router();

// POST: Add a new member
router.post('/add', async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json({ message: 'Member added', member: newMember });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save', error: err.message });
  }
});

// GET: Get all members
router.get('/all', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch', error: err.message });
  }
});

export default router;
