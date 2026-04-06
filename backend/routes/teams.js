const express = require('express');
const TeamPost = require('../models/TeamPost');

const router = express.Router();

// Get all team posts
router.get('/', async (req, res) => {
  try {
    const posts = await TeamPost.find()
      .populate('author', 'name email technicalDomains')
      .populate('applicants.user', 'name email technicalDomains')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new team post
router.post('/', async (req, res) => {
  try {
    const { author, title, description, requiredRoles } = req.body;
    const newPost = new TeamPost({
      author,
      title,
      description,
      requiredRoles
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply to a team post
router.post('/:id/apply', async (req, res) => {
  try {
    const { userId, role, message } = req.body;
    const post = await TeamPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Team post not found' });
    }
    
    // Check if user already applied
    if (post.applicants.some(a => a.user.toString() === userId)) {
      return res.status(400).json({ message: 'You have already applied to this post' });
    }

    post.applicants.push({ user: userId, role, message, status: 'pending' });
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update applicant status
router.put('/:id/applicants/:userId', async (req, res) => {
  try {
    const { status } = req.body;
    const post = await TeamPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Team post not found' });
    }

    const applicant = post.applicants.find(a => a.user.toString() === req.params.userId || (a.user._id && a.user._id.toString() === req.params.userId));
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete team post
router.delete('/:id', async (req, res) => {
  try {
    const post = await TeamPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Team post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
