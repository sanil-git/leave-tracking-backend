const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String },
  members: { type: [String], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema); 