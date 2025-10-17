const express = require('express');
const { body, validationResult } = require('express-validator');
const Checklist = require('../models/Checklist');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/checklists
// @desc    Get user's checklists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, phase, isTemplate } = req.query;
    
    let query = { user: req.user._id, isActive: true };
    
    if (category) query.category = category;
    if (phase) query.phase = phase;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    
    const checklists = await Checklist.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json({
      success: true,
      count: checklists.length,
      data: checklists
    });
  } catch (error) {
    console.error('Get checklists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/checklists/:id
// @desc    Get single checklist
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    }).populate('user', 'name email');
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    res.json({
      success: true,
      data: checklist
    });
  } catch (error) {
    console.error('Get checklist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/checklists
// @desc    Create new checklist
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('category').isIn(['housing', 'documents', 'packing', 'utilities', 'local_setup', 'transportation', 'finances', 'healthcare', 'education', 'other']).withMessage('Invalid category'),
  body('phase').isIn(['pre_move', 'move_day', 'post_move']).withMessage('Invalid phase'),
  body('destinationCity').trim().isLength({ min: 1, max: 100 }).withMessage('Destination city is required'),
  body('destinationCountry').trim().isLength({ min: 1, max: 100 }).withMessage('Destination country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const checklistData = {
      ...req.body,
      user: req.user._id
    };

    const checklist = new Checklist(checklistData);
    await checklist.save();

    res.status(201).json({
      success: true,
      message: 'Checklist created successfully',
      data: checklist
    });
  } catch (error) {
    console.error('Create checklist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/checklists/:id
// @desc    Update checklist
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const checklist = await Checklist.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isActive: true },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    res.json({
      success: true,
      message: 'Checklist updated successfully',
      data: checklist
    });
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/checklists/:id
// @desc    Delete checklist (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const checklist = await Checklist.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    res.json({
      success: true,
      message: 'Checklist deleted successfully'
    });
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/checklists/:id/items
// @desc    Add item to checklist
// @access  Private
router.post('/:id/items', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Item title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const checklist = await Checklist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    checklist.items.push(req.body);
    await checklist.save();

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: checklist
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/checklists/:id/items/:itemId
// @desc    Update checklist item
// @access  Private
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    const item = checklist.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update item properties
    Object.assign(item, req.body);
    
    // Set completedAt if item is being marked as completed
    if (req.body.isCompleted && !item.completedAt) {
      item.completedAt = new Date();
    } else if (!req.body.isCompleted && item.completedAt) {
      item.completedAt = null;
    }

    await checklist.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: checklist
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/checklists/:id/items/:itemId
// @desc    Delete checklist item
// @access  Private
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    checklist.items.pull(req.params.itemId);
    await checklist.save();

    res.json({
      success: true,
      message: 'Item deleted successfully',
      data: checklist
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
