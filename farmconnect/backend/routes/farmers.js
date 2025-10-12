const express = require('express');
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await User.find({ userType: 'farmer' })
      .select('name farmName location description')
      .sort({ name: 1 });

    res.json(farmers);
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get farmer profile
router.get('/:id', async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id)
      .select('-password');

    if (!farmer || farmer.userType !== 'farmer') {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Get farmer's products
    const products = await Product.find({ 
      farmer: req.params.id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({
      farmer,
      products
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update farmer profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can update farm profile' });
    }

    const { farmName, description, location, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        farmName,
        description,
        location: typeof location === 'string' ? { county: location, town: '' } : location,
        phone
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;