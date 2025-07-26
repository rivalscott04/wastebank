const express = require('express');
const router = express.Router();
const { WasteCategory, WastePrice } = require('../models');
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

    console.log('Create category request body:', req.body);
    const { name, description, price_per_kg, points_per_kg } = req.body;
    
    console.log('Extracted data:', { name, description, price_per_kg, points_per_kg });
    
    const category = await WasteCategory.create({
      name,
      description,
      price_per_kg,
      points_per_kg
    });

    console.log('Category created successfully:', category.toJSON());
    
    // Auto-create default waste price entry
    try {
      // Auto-determine icon based on category name
      const getIconForCategory = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('plastik') || name.includes('pet')) return '🥤';
        if (name.includes('kertas') || name.includes('kardus')) return '📦';
        if (name.includes('kaca') || name.includes('botol')) return '🍾';
        if (name.includes('aluminium') || name.includes('kaleng')) return '🥫';
        if (name.includes('dapur') || name.includes('organik')) return '🍽️';
        if (name.includes('elektronik') || name.includes('e-waste')) return '📱';
        if (name.includes('logam') || name.includes('besi')) return '🔧';
        if (name.includes('tekstil') || name.includes('kain')) return '👕';
        if (name.includes('kayu') || name.includes('furniture')) return '🪑';
        if (name.includes('karet') || name.includes('ban')) return '🛞';
        return '🗑️'; // Default icon
      };

      const autoIcon = getIconForCategory(category.name);
      
      await WastePrice.create({
        category_id: category.id,
        price_per_kg: price_per_kg || 3000.00, // Use provided price or default
        points_per_kg: points_per_kg || 3,     // Use provided points or default
        icon: autoIcon
      });
      console.log(`Default waste price created for new category with icon: ${autoIcon}`);
    } catch (priceError) {
      console.error('Failed to create default waste price:', priceError);
      // Don't fail the whole request if price creation fails
    }
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
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