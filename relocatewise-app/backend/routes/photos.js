const express = require('express');
const { body, validationResult } = require('express-validator');
const Photo = require('../models/Photo');
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/photos
// @desc    Get user's photos
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, checklist, tags } = req.query;
    
    let query = { user: req.user._id };
    
    if (category) query.category = category;
    if (checklist) query.checklist = checklist;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    const photos = await Photo.find(query)
      .sort({ takenAt: -1 })
      .populate('checklist', 'title category');
    
    res.json({
      success: true,
      count: photos.length,
      data: photos
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/photos
// @desc    Upload photo
// @access  Private
router.post('/', auth, upload.single('photo'), handleUploadError, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required'),
  body('category').isIn(['apartment_visit', 'receipt', 'id_document', 'contract', 'utility_bill', 'moving_box', 'before_after', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const photoData = {
      user: req.user._id,
      title: req.body.title,
      description: req.body.description || '',
      cloudinaryId: req.file.public_id,
      url: req.file.secure_url,
      thumbnailUrl: req.file.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      location: req.body.location ? JSON.parse(req.body.location) : null,
      fileSize: req.file.size,
      dimensions: {
        width: req.file.width,
        height: req.file.height
      }
    };

    if (req.body.checklist) photoData.checklist = req.body.checklist;
    if (req.body.checklistItem) photoData.checklistItem = req.body.checklistItem;

    const photo = new Photo(photoData);
    await photo.save();

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photo
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/:id
// @desc    Get single photo
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('checklist', 'title category');
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/photos/:id
// @desc    Update photo
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('category').optional().isIn(['apartment_visit', 'receipt', 'id_document', 'contract', 'utility_bill', 'moving_box', 'before_after', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const photo = await Photo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('checklist', 'title category');
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json({
      success: true,
      message: 'Photo updated successfully',
      data: photo
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete photo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete from Cloudinary
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    // Delete from database
    await Photo.findByIdAndDelete(photo._id);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
