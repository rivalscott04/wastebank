const express = require('express');
const router = express.Router();
const WasteCollection = require('../models/WasteCollection');
const WasteCollectionItem = require('../models/WasteCollectionItem');
const WasteCategory = require('../models/WasteCategory');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all waste collections (admin) or user's waste collections (nasabah)
router.get('/', auth, async (req, res) => {
  try {
    let collections;
    const include = [
      {
        model: WasteCollectionItem,
        as: 'items',
        include: [
          {
            model: WasteCategory,
            as: 'category'
          }
        ]
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: User,
        as: 'assignedStaff',
        attributes: ['id', 'name', 'email', 'phone']
      }
    ];

    if (req.user.role === 'admin') {
      collections = await WasteCollection.findAll({ include });
    } else {
      collections = await WasteCollection.findAll({
        where: { user_id: req.user.id },
        include
      });
    }

    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create waste collection request
router.post('/', auth, async (req, res) => {
  try {
    const { pickup_address, pickup_date, pickup_time_slot, notes, items } = req.body;

    // VALIDASI: Pastikan semua item punya category_id
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Minimal harus ada satu jenis sampah.' });
    }
    const invalidItem = items.find(item => !item.category_id);
    if (invalidItem) {
      return res.status(400).json({ message: 'Semua item harus memiliki category_id yang valid.' });
    }

    const collection = await WasteCollection.create({
      user_id: req.user.id,
      pickup_address,
      pickup_date,
      pickup_time_slot,
      notes,
      status: 'pending'
    });

    // Group items by category_id agar tidak redundant
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category_id]) {
        grouped[item.category_id] = { ...item };
      } else {
        grouped[item.category_id].estimated_weight += item.estimated_weight;
      }
    }
    const collectionItems = Object.values(grouped).map(item => ({
      waste_collection_id: collection.id,
      category_id: item.category_id,
      estimated_weight: item.estimated_weight
    }));
    await WasteCollectionItem.bulkCreate(collectionItems);

    // Fetch the created collection with its items
    const createdCollection = await WasteCollection.findByPk(collection.id, {
      include: [
        {
          model: WasteCollectionItem,
          as: 'items',
          include: [
            {
              model: WasteCategory,
              as: 'category'
            }
          ]
        }
      ]
    });

    res.status(201).json(createdCollection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update waste collection status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, assigned_staff_id } = req.body;
    const collection = await WasteCollection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection request not found' });
    }

    await collection.update({
      status,
      assigned_staff_id: assigned_staff_id || collection.assigned_staff_id
    });

    res.json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel waste collection request (nasabah only)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const collection = await WasteCollection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection request not found' });
    }

    if (collection.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (collection.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await collection.update({ status: 'cancelled' });
    res.json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 