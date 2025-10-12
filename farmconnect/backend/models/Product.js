const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['livestock', 'poultry', 'vegetables', 'fruits', 'dairy', 'other'],
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'piece'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  location: {
    county: String,
    town: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);