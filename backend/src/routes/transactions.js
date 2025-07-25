const express = require('express');
const router = express.Router();
const { Transaction, TransactionItem, WasteCollection, User, WasteCategory } = require('../models');
const auth = require('../middleware/auth');

// Get all transactions (admin) or user's transactions (nasabah)
router.get('/', auth, async (req, res) => {
  
    

  
  try {
    let transactions;
    const include = [
      {
        model: TransactionItem,
        as: 'items',
        include: [{
          model: WasteCategory,
          as: 'transactionCategory'
        }]
      },
      {
        model: User,
        as: 'transactionUser',
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: WasteCollection,
        as: 'waste_collection'
      }
    ];

    if (req.user.role === 'admin') {
      transactions = await Transaction.findAll({
        where: { payment_status: 'completed' },
        include
      });
    } else {
      transactions = await Transaction.findAll({
        where: { user_id: req.user.id, payment_status: 'completed' },
        include
      });
    }

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create transaction (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      user_id,
      waste_collection_id,
      items,
      payment_method,
      notes
    } = req.body;

    // Calculate totals
    let total_weight = 0;
    let total_amount = 0;
    let total_points = 0;

    // Create transaction
    const transaction = await Transaction.create({
      user_id,
      waste_collection_id,
      total_weight: 0, // Will update after creating items
      total_amount: 0,
      total_points: 0,
      payment_method,
      notes,
      payment_status: 'pending'
    });

    // Create transaction items
    if (items && items.length > 0) {
      const transactionItems = items.map(item => {
        const subtotal = item.weight * item.price_per_kg;
        total_weight += item.weight;
        total_amount += subtotal;
        total_points += item.points_earned;

        return {
          transaction_id: transaction.id,
          category_id: item.category_id,
          weight: item.weight,
          price_per_kg: item.price_per_kg,
          points_earned: item.points_earned,
          subtotal
        };
      });

      await TransactionItem.bulkCreate(transactionItems);

      // Update transaction totals
      await transaction.update({
        total_weight,
        total_amount,
        total_points
      });

      // Update user points
      const user = await User.findByPk(user_id);
      if (user) {
        const newTotalPoints = user.total_points + total_points;
        
        // Update rank based on points
        let newRank = 'Bronze';
        if (newTotalPoints >= 10000) newRank = 'Platinum';
        else if (newTotalPoints >= 5000) newRank = 'Gold';
        else if (newTotalPoints >= 1000) newRank = 'Silver';

        await user.update({
          total_points: newTotalPoints,
          rank: newRank
        });
      }

      // Update waste collection status if provided
      if (waste_collection_id) {
        await WasteCollection.update(
          { status: 'completed' },
          { where: { id: waste_collection_id } }
        );
      }
    }

    // Fetch the created transaction with its items
    const createdTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
                  include: [{
          model: WasteCategory,
          as: 'transactionCategory'
        }]
        }
      ]
    });

    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction payment status (admin only)
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { payment_status } = req.body;
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.update({ payment_status });
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 