const express = require('express');
const cors = require('cors');
const gymsRouter = require('./routes/gyms');
const profileRouter = require('./routes/profile');

const app = express();

// CORS configuration - restrict to frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware - CORS must come before routes
console.log('Applying CORS middleware with options:', corsOptions);
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/gyms', gymsRouter);
app.use('/profile', profileRouter);

module.exports = app;
