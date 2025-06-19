const express = require('express');
const router = express.Router();
const { User, Transaction, WasteCollection, RewardRedemption } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Endpoint aktivitas terbaru dashboard
router.get('/dashboard/activities', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Ambil data terbaru dari masing-masing tabel
    const [users, transactions, collections, redemptions] = await Promise.all([
      User.findAll({ where: { role: 'nasabah' }, order: [['createdAt', 'DESC']], limit: 5 }),
      Transaction.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'user' }] }),
      WasteCollection.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'user' }] }),
      RewardRedemption.findAll({ order: [['createdAt', 'DESC']], limit: 5, include: [{ model: User, as: 'user' }] })
    ]);
    // Gabungkan dan mapping ke format aktivitas
    const activities = [
      ...users.map(u => ({
        type: 'user',
        action: 'Nasabah baru mendaftar',
        user: u.name,
        time: u.createdAt,
      })),
      ...transactions.map(t => ({
        type: 'transaction',
        action: 'Transaksi sampah',
        user: t.user?.name || '-',
        time: t.createdAt,
      })),
      ...collections.map(c => ({
        type: 'pickup',
        action: 'Request jemput sampah',
        user: c.user?.name || '-',
        time: c.createdAt,
      })),
      ...redemptions.map(r => ({
        type: 'reward',
        action: 'Penukaran reward',
        user: r.user?.name || '-',
        time: r.createdAt,
      })),
    ];
    // Urutkan berdasarkan waktu terbaru
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint total berat sampah terkumpul
router.get('/dashboard/total-weight', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Hitung total berat dari transaksi yang sudah paid/completed
    const totalWeight = await Transaction.sum('total_weight', {
      where: {
        payment_status: ['paid', 'completed']
      }
    });
    res.json({ totalWeight: Number(totalWeight) || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 