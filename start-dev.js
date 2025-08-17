const express = require("express");
const cors = require("cors");

// Set default environment variables if .env is not loaded
if (!process.env.PORT) process.env.PORT = 8080;
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const app = express();

// Basic CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "E-commerce API is running...", 
    status: "success",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API status endpoint
app.get("/api/status", (req, res) => {
  res.json({ 
    message: "API endpoints are available", 
    status: "success",
    availableRoutes: [
      "/api/auth",
      "/api/users", 
      "/api/products",
      "/api/categories",
      "/api/brands",
      "/api/cart",
      "/api/favourites",
      "/api/address",
      "/api/payment",
      "/api/orders",
      "/api/order-details"
    ]
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📱 Health check: http://localhost:${PORT}/`);
  console.log(`🔍 API status: http://localhost:${PORT}/api/status`);
  console.log('\n⚠️  Note: This is a development server without database connection.');
  console.log('   To run with full functionality, create a .env file and run: npm start');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
