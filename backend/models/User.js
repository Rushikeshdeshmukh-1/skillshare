const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsTeach: [{ type: String }],
  skillsLearn: [{ type: String }],
  bio: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  linkedInLink: { type: String, default: '' },
  technicalDomains: [{ type: String }],
  pastProjects: [{
    title: String,
    description: String,
    link: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
