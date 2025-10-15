const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// CORS Configuration - FIXED
app.use(
  cors({
    origin: [
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ FIXED: Serve frontend UI images from sellfarm/images
app.use("/images", express.static(path.join(__dirname, "../sellfarm/images")));

// ✅ ADDED: Serve backend product images from backend/images
app.use("/products", express.static(path.join(__dirname, "images")));

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Database connection with better error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/farmconnect", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    console.log("💡 Please make sure MongoDB is running");
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/farmers", require("./routes/farmers"));
app.use("/api/admin", require("./routes/admin"));

// Seed route
app.post("/api/seed", async (req, res) => {
  try {
    const seedDatabase = require("./seed");
    await seedDatabase();
    res.json({ message: "Database seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Seeding failed", error: error.message });
  }
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`📍 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Frontend images: http://localhost:${PORT}/images/`);
  console.log(`📍 Product images: http://localhost:${PORT}/products/`);
});