// backend/seed.js - Run this to seed your database
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        console.log('Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@farmconnect.com',
            password: 'admin123',
            userType: 'admin',
            phone: '+254700000000',
            location: { county: 'Nairobi', town: 'Nairobi' }
        });

        // Create sample farmers
        const farmer1 = await User.create({
            name: 'John Mwangi',
            email: 'john@farmconnect.com',
            password: 'farmer123',
            userType: 'farmer',
            phone: '+254711111111',
            location: { county: 'Nakuru', town: 'Naivasha' },
            farmName: 'Mwangi Fresh Farms'
        });

        const farmer2 = await User.create({
            name: 'Jane Njeri',
            email: 'jane@farmconnect.com',
            password: 'farmer123',
            userType: 'farmer',
            phone: '+254722222222',
            location: { county: 'Kiambu', town: 'Thika' },
            farmName: 'Njeri Organic Farm'
        });

        // Create sample buyer
        const buyer = await User.create({
            name: 'David Ochieng',
            email: 'david@farmconnect.com',
            password: 'buyer123',
            userType: 'buyer',
            phone: '+254733333333',
            location: { county: 'Nairobi', town: 'Westlands' }
        });

        // Create sample products
        const products = [
            {
                name: 'Fresh Tomatoes',
                description: 'Freshly harvested tomatoes from our farm, perfect for cooking and salads.',
                price: 150,
                category: 'vegetables',
                farmer: farmer1._id,
                quantity: 50,
                unit: 'kg',
                status: 'approved',
                location: farmer1.location,
                images: ['/uploads/tomatoes.jpg']
            },
            {
                name: 'Organic Chicken',
                description: 'Free-range organic chicken, raised without antibiotics or hormones.',
                price: 800,
                category: 'poultry',
                farmer: farmer2._id,
                quantity: 20,
                unit: 'piece',
                status: 'approved',
                location: farmer2.location,
                images: ['/uploads/chicken.jpg']
            },
            {
                name: 'Fresh Milk',
                description: 'Fresh dairy milk from grass-fed cows, delivered daily.',
                price: 80,
                category: 'dairy',
                farmer: farmer1._id,
                quantity: 100,
                unit: 'litre',
                status: 'approved',
                location: farmer1.location,
                images: ['/uploads/milk.jpg']
            },
            {
                name: 'Sukuma Wiki',
                description: 'Fresh kale leaves, rich in vitamins and minerals.',
                price: 50,
                category: 'vegetables',
                farmer: farmer2._id,
                quantity: 30,
                unit: 'bunch',
                status: 'approved',
                location: farmer2.location,
                images: ['/uploads/sukuma.jpg']
            },
            {
                name: 'Goat Meat',
                description: 'Fresh goat meat, perfect for traditional dishes.',
                price: 1200,
                category: 'livestock',
                farmer: farmer1._id,
                quantity: 10,
                unit: 'kg',
                status: 'pending',
                location: farmer1.location,
                images: ['/uploads/goat.jpg']
            },
            {
                name: 'Avocados',
                description: 'Creamy Hass avocados, perfect for guacamole or salads.',
                price: 30,
                category: 'fruits',
                farmer: farmer2._id,
                quantity: 40,
                unit: 'piece',
                status: 'approved',
                location: farmer2.location,
                images: ['/uploads/avocado.jpg']
            },
            {
                name: 'Eggs',
                description: 'Fresh farm eggs from free-range chickens.',
                price: 300,
                category: 'poultry',
                farmer: farmer1._id,
                quantity: 60,
                unit: 'dozen',
                status: 'approved',
                location: farmer1.location,
                images: ['/uploads/eggs.jpg']
            },
            {
                name: 'Potatoes',
                description: 'Fresh Irish potatoes, great for frying or boiling.',
                price: 100,
                category: 'vegetables',
                farmer: farmer2._id,
                quantity: 80,
                unit: 'kg',
                status: 'approved',
                location: farmer2.location,
                images: ['/uploads/potatoes.jpg']
            }
        ];

        await Product.insertMany(products);

        console.log('Created sample data:');
        console.log('- Admin: admin@farmconnect.com / admin123');
        console.log('- Farmer 1: john@farmconnect.com / farmer123');
        console.log('- Farmer 2: jane@farmconnect.com / farmer123');
        console.log('- Buyer: david@farmconnect.com / buyer123');
        console.log('- 8 sample products (1 pending approval)');

        console.log('Database seeded successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();