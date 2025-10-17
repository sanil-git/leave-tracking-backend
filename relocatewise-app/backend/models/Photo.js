const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checklist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checklist',
    default: null
  },
  checklistItem: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  title: {
    type: String,
    required: [true, 'Photo title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required']
  },
  url: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['apartment_visit', 'receipt', 'id_document', 'contract', 'utility_bill', 'moving_box', 'before_after', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    city: String,
    country: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  takenAt: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    default: 0
  },
  dimensions: {
    width: Number,
    height: Number
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);
