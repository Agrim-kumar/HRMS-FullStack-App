const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./db');
const { errorHandler } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const teamRoutes = require('./routes/teams');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://frontend-blond-eight-21.vercel.app/login',
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// New: Root route to ensure the base URL returns a success message instead of "Cannot GET /"
app.get('/', (req, res) => {
  res.json({
    message: 'HRMS Backend API is running successfully!',
    api_base_path: '/api',
    health_check: '/health'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/teams', teamRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
