const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        phone: user.phone,
        department: user.department,
        position: user.position,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', async (req, res) => {
  try {
    const { name, bio, phone, department, position } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        bio,
        phone,
        department,
        position
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        phone: user.phone,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/profile/photo
// @desc    Upload profile photo
// @access  Private
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Delete old photo if exists
    if (user.profilePhoto && fs.existsSync(user.profilePhoto)) {
      fs.unlinkSync(user.profilePhoto);
    }
    
    // Update user with new photo path
    user.profilePhoto = req.file.path;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/profile/tasks
// @desc    Get user's completed tasks history
// @access  Private
router.get('/tasks', async (req, res) => {
  try {
    const completedTasks = await Task.find({
      $or: [
        { user: req.user._id, status: 'completed' },
        { assignedTo: req.user._id, status: 'completed' }
      ]
    })
      .populate('user', 'name email profilePhoto')
      .populate('assignedTo', 'name email profilePhoto')
      .sort({ updatedAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      count: completedTasks.length,
      data: completedTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;
