require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/waste-categories', require('./routes/wasteCategories'));
app.use('/api/waste-collections', require('./routes/wasteCollections'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/reward-redemptions', require('./routes/rewardRedemptions'));

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WasteBank API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 