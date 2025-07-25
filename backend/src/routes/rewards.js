const express = require('express');
const router = express.Router();
const { Reward } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all rewards
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.findAll({
      where: { 
        is_active: true,
        stock: { [Op.gt]: 0 },
        [Op.or]: [
          { expiry_date: null },
          { expiry_date: { [Op.gt]: new Date() } }
        ]
      }
    });
    res.json(rewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create reward (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, points_required, stock, image, expiry_date } = req.body;
    const reward = await Reward.create({
      name,
      description,
      points_required,
      stock,
      image,
      expiry_date
    });

    res.status(201).json(reward);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reward (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reward = await Reward.findByPk(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const { name, description, points_required, stock, image, expiry_date, is_active } = req.body;
    await reward.update({
      name,
      description,
      points_required,
      stock,
      image,
      expiry_date,
      is_active
    });

    res.json(reward);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reward (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reward = await Reward.findByPk(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Soft delete by setting is_active to false
    await reward.update({ is_active: false });

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 