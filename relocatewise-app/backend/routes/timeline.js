const express = require('express');
const Checklist = require('../models/Checklist');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/timeline
// @desc    Get user's timeline with all phases
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { destinationCity, destinationCountry } = req.query;
    
    let query = { user: req.user._id, isActive: true };
    
    if (destinationCity) query.destinationCity = destinationCity;
    if (destinationCountry) query.destinationCountry = destinationCountry;
    
    const checklists = await Checklist.find(query)
      .sort({ phase: 1, createdAt: -1 });
    
    // Group by phases
    const timeline = {
      pre_move: checklists.filter(c => c.phase === 'pre_move'),
      move_day: checklists.filter(c => c.phase === 'move_day'),
      post_move: checklists.filter(c => c.phase === 'post_move')
    };
    
    // Calculate overall progress
    const totalItems = checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const completedItems = checklists.reduce((sum, checklist) => 
      sum + checklist.items.filter(item => item.isCompleted).length, 0
    );
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        timeline,
        stats: {
          totalChecklists: checklists.length,
          totalItems,
          completedItems,
          overallProgress
        }
      }
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timeline/phase/:phase
// @desc    Get timeline for specific phase
// @access  Private
router.get('/phase/:phase', auth, async (req, res) => {
  try {
    const { phase } = req.params;
    const { destinationCity, destinationCountry } = req.query;
    
    if (!['pre_move', 'move_day', 'post_move'].includes(phase)) {
      return res.status(400).json({ message: 'Invalid phase' });
    }
    
    let query = { 
      user: req.user._id, 
      phase,
      isActive: true 
    };
    
    if (destinationCity) query.destinationCity = destinationCity;
    if (destinationCountry) query.destinationCountry = destinationCountry;
    
    const checklists = await Checklist.find(query)
      .sort({ createdAt: -1 });
    
    // Calculate phase progress
    const totalItems = checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const completedItems = checklists.reduce((sum, checklist) => 
      sum + checklist.items.filter(item => item.isCompleted).length, 0
    );
    const phaseProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        phase,
        checklists,
        stats: {
          totalChecklists: checklists.length,
          totalItems,
          completedItems,
          phaseProgress
        }
      }
    });
  } catch (error) {
    console.error('Get phase timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timeline/upcoming
// @desc    Get upcoming tasks (due within next 7 days)
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const checklists = await Checklist.find({
      user: req.user._id,
      isActive: true,
      'items.dueDate': {
        $lte: sevenDaysFromNow,
        $gte: new Date()
      },
      'items.isCompleted': false
    });
    
    const upcomingTasks = [];
    checklists.forEach(checklist => {
      checklist.items.forEach(item => {
        if (item.dueDate && item.dueDate <= sevenDaysFromNow && !item.isCompleted) {
          upcomingTasks.push({
            ...item.toObject(),
            checklist: {
              id: checklist._id,
              title: checklist.title,
              category: checklist.category,
              phase: checklist.phase
            }
          });
        }
      });
    });
    
    // Sort by due date
    upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json({
      success: true,
      count: upcomingTasks.length,
      data: upcomingTasks
    });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timeline/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', auth, async (req, res) => {
  try {
    const now = new Date();
    
    const checklists = await Checklist.find({
      user: req.user._id,
      isActive: true,
      'items.dueDate': { $lt: now },
      'items.isCompleted': false
    });
    
    const overdueTasks = [];
    checklists.forEach(checklist => {
      checklist.items.forEach(item => {
        if (item.dueDate && item.dueDate < now && !item.isCompleted) {
          overdueTasks.push({
            ...item.toObject(),
            checklist: {
              id: checklist._id,
              title: checklist.title,
              category: checklist.category,
              phase: checklist.phase
            }
          });
        }
      });
    });
    
    // Sort by due date (oldest first)
    overdueTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json({
      success: true,
      count: overdueTasks.length,
      data: overdueTasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
