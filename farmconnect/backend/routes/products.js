const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all approved products
router.get('/', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        
        let query = { status: 'approved' };
        
        if (category && category !== 'all') query.category = category;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query)
            .populate('farmer', 'name farmName location phone')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' })
            .populate('farmer', 'name farmName location')
            .limit(8)
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new product (Farmer only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can add products' });
        }

        const { name, description, price, category, quantity, unit } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            category,
            quantity: parseInt(quantity) || 1,
            unit: unit || 'piece',
            farmer: req.user._id,
            location: req.user.location,
            images: ['/images/default-product.jpg'] // Default image
        });

        await product.populate('farmer', 'name farmName location');
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get farmer's products
router.get('/my-products', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'farmer') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const products = await Product.find({ farmer: req.user._id })
            .populate('farmer', 'name farmName location')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmer', 'name farmName location phone');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;