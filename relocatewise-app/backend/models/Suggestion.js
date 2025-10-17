const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    lowercase: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['housing', 'documents', 'packing', 'utilities', 'local_setup', 'transportation', 'finances', 'healthcare', 'education', 'culture', 'language', 'weather', 'safety']
  },
  phase: {
    type: String,
    required: [true, 'Phase is required'],
    enum: ['pre_move', 'move_day', 'post_move'],
    default: 'pre_move'
  },
  title: {
    type: String,
    required: [true, 'Suggestion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimatedTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Estimated time cannot be more than 50 characters']
  },
  cost: {
    type: String,
    trim: true,
    maxlength: [50, 'Cost cannot be more than 50 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  tips: [{
    type: String,
    trim: true
  }],
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['website', 'document', 'app', 'service', 'contact']
    }
  }],
  applicableFor: [{
    type: String,
    enum: ['citizen', 'expat', 'student', 'worker', 'tourist', 'all']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Compound index for efficient city-based queries
suggestionSchema.index({ city: 1, country: 1, category: 1, phase: 1 });

module.exports = mongoose.model('Suggestion', suggestionSchema);
