const express = require('express');
const Suggestion = require('../models/Suggestion');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/suggestions
// @desc    Get suggestions for a city
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { city, country, category, phase, priority } = req.query;
    
    if (!city || !country) {
      return res.status(400).json({ 
        message: 'City and country are required' 
      });
    }
    
    let query = { 
      city: city.toLowerCase(), 
      country: country.toLowerCase(),
      isActive: true 
    };
    
    if (category) query.category = category;
    if (phase) query.phase = phase;
    if (priority) query.priority = priority;
    
    const suggestions = await Suggestion.find(query)
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/suggestions/categories
// @desc    Get available categories for a city
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const { city, country } = req.query;
    
    if (!city || !country) {
      return res.status(400).json({ 
        message: 'City and country are required' 
      });
    }
    
    const categories = await Suggestion.distinct('category', {
      city: city.toLowerCase(),
      country: country.toLowerCase(),
      isActive: true
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/suggestions/priority
// @desc    Get high priority suggestions for a city
// @access  Private
router.get('/priority', auth, async (req, res) => {
  try {
    const { city, country } = req.query;
    
    if (!city || !country) {
      return res.status(400).json({ 
        message: 'City and country are required' 
      });
    }
    
    const suggestions = await Suggestion.find({
      city: city.toLowerCase(),
      country: country.toLowerCase(),
      priority: { $in: ['high', 'critical'] },
      isActive: true
    }).sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Get priority suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/suggestions/search
// @desc    Search suggestions by text
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, city, country, category, phase } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }
    
    let query = {
      $text: { $search: q },
      isActive: true
    };
    
    if (city && country) {
      query.city = city.toLowerCase();
      query.country = country.toLowerCase();
    }
    
    if (category) query.category = category;
    if (phase) query.phase = phase;
    
    const suggestions = await Suggestion.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/suggestions
// @desc    Create new suggestion (admin only - for seeding data)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    // In a real app, you'd check if user is admin
    // For now, we'll allow any authenticated user to create suggestions
    
    const suggestion = new Suggestion(req.body);
    await suggestion.save();
    
    res.status(201).json({
      success: true,
      message: 'Suggestion created successfully',
      data: suggestion
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
