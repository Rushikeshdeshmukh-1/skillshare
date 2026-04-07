const express = require('express');
const SwapRequest = require('../models/SwapRequest');

const router = express.Router();

// Send swap request
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    
    if (sender === receiver) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }
    
    // Check if request already exists
    const existingRequest = await SwapRequest.findOne({
      sender,
      receiver,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const newRequest = new SwapRequest({ sender, receiver, message });
    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get requests for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const received = await SwapRequest.find({ receiver: userId }).populate('sender', 'name email skillsTeach githubLink linkedInLink');
    const sent = await SwapRequest.find({ sender: userId }).populate('receiver', 'name email skillsLearn githubLink linkedInLink');
    
    res.json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept/Reject request
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete or Cancel a request
router.delete('/:id', async (req, res) => {
  try {
    const request = await SwapRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
