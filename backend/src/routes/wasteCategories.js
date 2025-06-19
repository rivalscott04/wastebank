const express = require('express');
const router = express.Router();
const WasteCategory = require('../models/WasteCategory');
const auth = require('../middleware/auth');

// Get all waste categories
router.get('/', async (req, res) => {
  try {
    const categories = await WasteCategory.findAll({
      attributes: ['id', 'name']
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create waste category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, price_per_kg, points_per_kg } = req.body;
    const category = await WasteCategory.create({
      name,
      description,
      price_per_kg,
      points_per_kg
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update waste category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = await WasteCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, price_per_kg, points_per_kg, is_active } = req.body;
    await category.update({
      name,
      description,
      price_per_kg,
      points_per_kg,
      is_active
    });

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete waste category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = await WasteCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Soft delete by setting is_active to false
    await category.update({ is_active: false });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 