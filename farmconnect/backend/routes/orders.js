const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { products, shippingAddress, customerName, customerPhone, paymentMethod } = req.body;

    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (product.status !== 'approved') {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      totalAmount += product.price * item.quantity;
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      customerName,
      customerPhone,
      paymentMethod
    });

    await order.populate('products.product', 'name images');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product', 'name images farmer')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;