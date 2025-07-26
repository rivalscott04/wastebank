const express = require('express');
const router = express.Router();
const { WasteCollection, WasteCollectionItem, User, Transaction, TransactionItem } = require('../models');
const WasteCategory = require('../models/WasteCategory');
const auth = require('../middleware/auth');

console.log('=== WASTE COLLECTIONS ROUTES LOADED ===');

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

    console.log('=== DEBUG: GET Response ===');
    console.log('Collections count:', collections.length);
    collections.forEach((collection, index) => {
      console.log(`Collection ${index + 1}:`, {
        id: collection.id,
        items_count: collection.items?.length || 0,
        items: collection.items?.map(item => ({
          category_id: item.category_id,
          estimated_weight: item.estimated_weight,
          category_name: item.category?.name
        }))
      });
    });

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
    
    console.log('=== DEBUG: Request Body ===');
    console.log('Items received:', items);
    console.log('Items count:', items.length);

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
    
    console.log('=== DEBUG: After Grouping ===');
    console.log('Grouped items:', grouped);
    console.log('Grouped count:', Object.keys(grouped).length);
    
    const collectionItems = Object.values(grouped).map(item => ({
      waste_collection_id: collection.id,
      category_id: item.category_id,
      estimated_weight: item.estimated_weight
    }));
    
    console.log('=== DEBUG: Items to Save ===');
    console.log('Collection items:', collectionItems);
    
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

// Update status penjemputan
router.patch('/:id/status', auth, async (req, res) => {
  console.log('=== ENDPOINT CALLED: PATCH /:id/status ===');
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);
  console.log('User role:', req.user.role);
  
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { status } = req.body;
    const { id } = req.params;

    // Validasi status (opsional)
    const allowedStatus = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'approved', 'disetujui', 'menunggu'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    console.log('=== DEBUG: Status Update ===');
    console.log('Status to update:', status);
    console.log('Collection ID:', id);
    
    // Update status di database
    const [updated] = await WasteCollection.update(
      { status },
      { where: { id } }
    );

    console.log('=== DEBUG: Status Check ===');
    console.log('Status is completed?', status === 'completed');
    
    // Jika status diubah menjadi 'completed', buat transaksi otomatis
    if (status === 'completed') {
      console.log('=== DEBUG: Creating Transaction ===');
      
      // Ambil data penjemputan dan item
      const collection = await WasteCollection.findByPk(id, {
        include: [{ model: WasteCollectionItem, as: 'items' }]
      });
      
      console.log('Collection found:', !!collection);
      console.log('Items count:', collection?.items?.length || 0);
      
      if (collection && collection.items && collection.items.length > 0) {
        let total_amount = 0;
        let total_points = 0;
        let total_weight = 0;
        const transactionItems = [];
        
        for (const item of collection.items) {
          
          const category = await WasteCategory.findByPk(item.category_id);
          if (!category) {
            console.log('Category not found for ID:', item.category_id);
            continue;
          }
          
          const price_per_kg = Number(category.price_per_kg);
          const points_per_kg = Number(category.points_per_kg);
          const weight = Number(item.estimated_weight);
          const subtotal = price_per_kg * weight;
          const points_earned = points_per_kg * weight;
          
          total_amount += subtotal;
          total_points += points_earned;
          total_weight += weight;
          transactionItems.push({
            category_id: item.category_id,
            weight,
            price_per_kg,
            points_earned,
            subtotal
          });
        }
        
        console.log('Transaction totals:', {
          total_amount,
          total_points,
          total_weight,
          items_count: transactionItems.length
        });
        
        const transactionData = {
          user_id: collection.user_id,
          waste_collection_id: collection.id,
          total_amount,
          total_points,
          total_weight,
          payment_method: 'cash',
          payment_status: 'completed',
          notes: 'Transaksi otomatis dari penjemputan selesai'
        };
        
        // Buat transaksi
        const transaction = await Transaction.create(transactionData);
        
        console.log('Transaction created:', transaction.id);
        
        // Buat item transaksi
        for (const tItem of transactionItems) {
          await TransactionItem.create({
            transaction_id: transaction.id,
            category_id: tItem.category_id,
            weight: tItem.weight,
            price_per_kg: tItem.price_per_kg,
            points_earned: tItem.points_earned,
            subtotal: tItem.subtotal
          });
        }
        
        console.log('Transaction items created');
        
        // Points akan dihitung otomatis dari transaksi, tidak perlu update manual
      } else {
        console.log('No items found in collection or collection not found');
      }
    }

    if (updated) {
      return res.json({ message: 'Status updated successfully' });
    } else {
      return res.status(404).json({ message: 'Data not found' });
    }
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