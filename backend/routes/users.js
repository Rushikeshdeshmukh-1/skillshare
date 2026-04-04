const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get all users (for browse)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user skills
router.put('/:id/skills', async (req, res) => {
  try {
    const { skillsTeach, skillsLearn, bio, githubLink } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (skillsTeach) user.skillsTeach = skillsTeach;
    if (skillsLearn) user.skillsLearn = skillsLearn;
    if (bio !== undefined) user.bio = bio;
    if (githubLink !== undefined) user.githubLink = githubLink;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
