const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Journal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  location: {
    city: String,
    country: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  mood: {
    type: String,
    enum: ['excited', 'nervous', 'stressed', 'happy', 'sad', 'neutral', 'overwhelmed', 'confident'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Calculate word count and reading time before saving
journalEntrySchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
    this.readingTime = Math.ceil(words.length / 200); // Average reading speed: 200 words per minute
  }
  next();
});

// Text search index for RAG functionality
journalEntrySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Journal', journalEntrySchema);
