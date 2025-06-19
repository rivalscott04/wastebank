const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction } = require('../models');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'nasabah', phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by model hook
      role,
      phone,
      address
    });

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hitung total berat dan total transaksi user
    const totalWaste = await Transaction.sum('total_weight', {
      where: { user_id: user.id, payment_status: ['paid', 'completed'] }
    });
    const totalTransactions = await Transaction.count({
      where: { user_id: user.id, payment_status: ['paid', 'completed'] }
    });

    // Hitung next rank points
    const points = user.points || 0;
    let rank = 'Bronze';
    let nextRankPoints = 1000 - points;
    if (points >= 10000) {
      rank = 'Platinum';
      nextRankPoints = 0;
    } else if (points >= 5000) {
      rank = 'Gold';
      nextRankPoints = 10000 - points;
    } else if (points >= 1000) {
      rank = 'Silver';
      nextRankPoints = 5000 - points;
    }
    if (nextRankPoints < 0) nextRankPoints = 0;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      points,
      rank,
      next_rank_points: nextRankPoints,
      total_waste_collected: Number(totalWaste) || 0,
      total_transactions: totalTransactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

module.exports = router; 