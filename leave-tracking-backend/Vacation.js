const mongoose = require('mongoose');

const vacationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  fromDate: {
    type: String,
    required: true
  },
  toDate: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['EL', 'SL', 'CL'],
    default: 'EL'
  },
  days: {
    type: Number,
    required: true,
    min: 1
  },
  // Approval workflow fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vacation', vacationSchema);
