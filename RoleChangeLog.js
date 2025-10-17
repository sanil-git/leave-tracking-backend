const mongoose = require('mongoose');

const roleChangeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  oldRole: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    required: true
  },
  newRole: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedByEmail: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
roleChangeLogSchema.index({ userId: 1, timestamp: -1 });
roleChangeLogSchema.index({ changedBy: 1, timestamp: -1 });
roleChangeLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('RoleChangeLog', roleChangeLogSchema);
