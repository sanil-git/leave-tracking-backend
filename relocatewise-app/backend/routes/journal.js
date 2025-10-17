const express = require('express');
const { body, validationResult } = require('express-validator');
const Journal = require('../models/Journal');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/journal
// @desc    Get user's journal entries
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tags, 
      mood, 
      location, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { user: req.user._id };
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    // Filter by mood
    if (mood) {
      query.mood = mood;
    }
    
    // Filter by location
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const entries = await Journal.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('photos', 'url thumbnailUrl title');
    
    const total = await Journal.countDocuments(query);
    
    res.json({
      success: true,
      data: entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEntries: total,
        hasNext: skip + entries.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/journal/:id
// @desc    Get single journal entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('photos', 'url thumbnailUrl title');
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/journal
// @desc    Create new journal entry
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content is required and must be less than 10000 characters'),
  body('mood').optional().isIn(['excited', 'nervous', 'stressed', 'happy', 'sad', 'neutral', 'overwhelmed', 'confident']).withMessage('Invalid mood'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('location.city').optional().trim().isLength({ max: 100 }).withMessage('City name too long'),
  body('location.country').optional().trim().isLength({ max: 100 }).withMessage('Country name too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const entryData = {
      ...req.body,
      user: req.user._id
    };

    const entry = new Journal(entryData);
    await entry.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: entry
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update journal entry
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content').optional().trim().isLength({ min: 1, max: 10000 }).withMessage('Content must be less than 10000 characters'),
  body('mood').optional().isIn(['excited', 'nervous', 'stressed', 'happy', 'sad', 'neutral', 'overwhelmed', 'confident']).withMessage('Invalid mood')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('photos', 'url thumbnailUrl title');
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/journal/tags
// @desc    Get all unique tags for user
// @access  Private
router.get('/tags', auth, async (req, res) => {
  try {
    const tags = await Journal.distinct('tags', { user: req.user._id });
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/journal/stats
// @desc    Get journal statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalEntries = await Journal.countDocuments({ user: req.user._id });
    const totalWords = await Journal.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalWords: { $sum: '$wordCount' } } }
    ]);
    
    const moodStats = await Journal.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const locationStats = await Journal.aggregate([
      { $match: { user: req.user._id, 'location.city': { $exists: true } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalEntries,
        totalWords: totalWords[0]?.totalWords || 0,
        moodStats,
        locationStats
      }
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
