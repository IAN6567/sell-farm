const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/admin', require('./routes/admin'));

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'FarmConnect API is running!' });
});

// Add this route before the static file serving
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

// Seed database function
async function seedDatabase() {
  const User = require('./models/User');
  const Product = require('./models/Product');

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});

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
    email: 'farmer1@farmconnect.com',
    password: 'farmer123',
    userType: 'farmer',
    phone: '+254711111111',
    location: { county: 'Nakuru', town: 'Naivasha' },
    farmName: 'Mwangi Fresh Farms'
  });

  const farmer2 = await User.create({
    name: 'Jane Njeri',
    email: 'farmer2@farmconnect.com',
    password: 'farmer123',
    userType: 'farmer',
    phone: '+254722222222',
    location: { county: 'Kiambu', town: 'Thika' },
    farmName: 'Njeri Organic Farm'
  });

  // Create sample products
  const products = [
    {
      name: 'Fresh Tomatoes',
      description: 'Freshly harvested tomatoes from our farm',
      price: 150,
      category: 'vegetables',
      farmer: farmer1._id,
      quantity: 50,
      unit: 'kg',
      status: 'approved',
      location: farmer1.location,
      images: ['/images/tomatoes.jpg']
    },
    {
      name: 'Organic Chicken',
      description: 'Free-range organic chicken',
      price: 800,
      category: 'poultry',
      farmer: farmer2._id,
      quantity: 20,
      unit: 'piece',
      status: 'approved',
      location: farmer2.location,
      images: ['/images/chicken.jpg']
    },
    {
      name: 'Fresh Milk',
      description: 'Fresh dairy milk',
      price: 80,
      category: 'dairy',
      farmer: farmer1._id,
      quantity: 100,
      unit: 'litre',
      status: 'approved',
      location: farmer1.location,
      images: ['/images/milk.jpg']
    },
    {
      name: 'Sukuma Wiki',
      description: 'Fresh kale leaves',
      price: 50,
      category: 'vegetables',
      farmer: farmer2._id,
      quantity: 30,
      unit: 'bunch',
      status: 'approved',
      location: farmer2.location,
      images: ['/images/sukuma.jpg']
    },
    {
      name: 'Goat Meat',
      description: 'Fresh goat meat',
      price: 1200,
      category: 'livestock',
      farmer: farmer1._id,
      quantity: 10,
      unit: 'kg',
      status: 'pending',
      location: farmer1.location,
      images: ['/images/goat.jpg']
    }
  ];

  await Product.insertMany(products);

  console.log('Database seeded with sample data');
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});