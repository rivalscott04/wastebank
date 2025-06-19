const express = require('express');
const router = express.Router();
const RewardRedemption = require('../models/RewardRedemption');
const Reward = require('../models/Reward');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all redemptions (admin) or user's redemptions (nasabah)
router.get('/', auth, async (req, res) => {
  try {
    let redemptions;
    const include = [
      {
        model: Reward,
        as: 'reward'
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }
    ];

    if (req.user.role === 'admin') {
      redemptions = await RewardRedemption.findAll({ include });
    } else {
      redemptions = await RewardRedemption.findAll({
        where: { user_id: req.user.id },
        include
      });
    }

    res.json(redemptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create redemption request
router.post('/', auth, async (req, res) => {
  try {
    const { reward_id } = req.body;

    // Check if reward exists and is available
    const reward = await Reward.findOne({
      where: {
        id: reward_id,
        is_active: true,
        stock: { [Op.gt]: 0 }
      }
    });

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found or not available' });
    }

    // Check if user has enough points
    const user = await User.findByPk(req.user.id);
    if (user.total_points < reward.points_required) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Create redemption
    const redemption = await RewardRedemption.create({
      user_id: req.user.id,
      reward_id,
      points_spent: reward.points_required,
      status: 'pending'
    });

    // Deduct points from user
    await user.update({
      total_points: user.total_points - reward.points_required
    });

    // Decrease reward stock
    await reward.update({
      stock: reward.stock - 1
    });

    // Fetch the created redemption with its associations
    const createdRedemption = await RewardRedemption.findByPk(redemption.id, {
      include: [
        {
          model: Reward,
          as: 'reward'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    res.status(201).json(createdRedemption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update redemption status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    const redemption = await RewardRedemption.findByPk(req.params.id, {
      include: [
        {
          model: Reward,
          as: 'reward'
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!redemption) {
      return res.status(404).json({ message: 'Redemption not found' });
    }

    // If cancelling the redemption, return points to user
    if (status === 'cancelled' && redemption.status !== 'cancelled') {
      await redemption.user.update({
        total_points: redemption.user.total_points + redemption.points_spent
      });

      // Return stock to reward
      await redemption.reward.update({
        stock: redemption.reward.stock + 1
      });
    }

    await redemption.update({ status });
    res.json(redemption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 