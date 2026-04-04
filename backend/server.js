require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main DB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to external MongoDB');
    } else {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('No MONGODB_URI found, starting in-memory DB...');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to In-Memory MongoDB at', mongoUri);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
