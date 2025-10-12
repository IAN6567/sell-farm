const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Get pending products for approval
router.get('/pending-products', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const products = await Product.find({ status: 'pending' })
            .populate('farmer', 'name email phone farmName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({ status: 'pending' });

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get pending products error:', error);
        res.status(500).json({ message: 'Error fetching pending products', error: error.message });
    }
});

// Approve/reject product
router.patch('/products/:id/status', auth, adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('farmer', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: `Product ${status} successfully`, product });
    } catch (error) {
        console.error('Update product status error:', error);
        res.status(500).json({ message: 'Error updating product status', error: error.message });
    }
});

// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ userType: 'farmer' });
        const totalProducts = await Product.countDocuments();
        const pendingProducts = await Product.countDocuments({ status: 'pending' });
        const totalOrders = await Order.countDocuments();
        
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalUsers,
            totalFarmers,
            totalProducts,
            pendingProducts,
            totalOrders,
            totalRevenue: totalRevenueResult[0]?.total || 0
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

module.exports = router;