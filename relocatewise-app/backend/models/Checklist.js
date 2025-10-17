const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const checklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Checklist title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['housing', 'documents', 'packing', 'utilities', 'local_setup', 'transportation', 'finances', 'healthcare', 'education', 'other']
  },
  phase: {
    type: String,
    required: [true, 'Phase is required'],
    enum: ['pre_move', 'move_day', 'post_move'],
    default: 'pre_move'
  },
  destinationCity: {
    type: String,
    required: [true, 'Destination city is required'],
    trim: true
  },
  destinationCountry: {
    type: String,
    required: [true, 'Destination country is required'],
    trim: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  },
  items: [checklistItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Calculate completion percentage
checklistSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  const completedItems = this.items.filter(item => item.isCompleted).length;
  return Math.round((completedItems / this.items.length) * 100);
});

// Ensure virtual fields are serialized
checklistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Checklist', checklistSchema);
