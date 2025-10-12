const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: true
  },
  description: String,
  location: {
    county: String,
    town: String
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', farmerSchema);