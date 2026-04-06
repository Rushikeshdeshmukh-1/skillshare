require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const teamRoutes = require('./routes/teams');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main DB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap').then(() => {
  console.log('Connected to permanent Local MongoDB at mongodb://127.0.0.1:27017/skillswap');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/teams', teamRoutes);

app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
