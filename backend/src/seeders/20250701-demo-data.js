'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    const password = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin Wastebank',
        email: 'admin@wastebank.com',
        password,
        role: 'admin',
        phone: '0811111111',
        address: 'Jl. Admin No. 1',
        points: 0,
        date_of_birth: '1990-01-01',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Siti Rahayu',
        email: 'siti@example.com',
        password,
        role: 'nasabah',
        phone: '081234567892',
        address: 'Jl. Melati No. 15, RT 03/RW 04, Kelurahan Sukajadi',
        points: 1250,
        date_of_birth: '1995-06-18',
        gender: 'female',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password,
        role: 'nasabah',
        phone: '081234567893',
        address: 'Jl. Mawar No. 10, RT 01/RW 02, Kelurahan Sukamaju',
        points: 800,
        date_of_birth: '1992-03-10',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // WasteCategories
    await queryInterface.bulkInsert('WasteCategories', [
      { name: 'Plastik PET', description: 'Sampah plastik', price_per_kg: 2000, points_per_kg: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kertas Kardus', description: 'Sampah kertas', price_per_kg: 1500, points_per_kg: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Botol Kaca', description: 'Sampah botol kaca', price_per_kg: 5000, points_per_kg: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kaleng Aluminium', description: 'Sampah kaleng aluminium', price_per_kg: 8000, points_per_kg: 8, createdAt: new Date(), updatedAt: new Date() }
    ]);

    // WasteCollections
    await queryInterface.bulkInsert('WasteCollections', [
      {
        user_id: 2, // Siti Rahayu
        pickup_address: 'Jl. Melati No. 15, RT 03/RW 04, Kelurahan Sukajadi',
        pickup_date: '2025-06-20',
        pickup_time_slot: 'afternoon',
        status: 'confirmed',
        notes: 'Tolong datang sebelum jam 2',
        assigned_staff_id: 1, // Admin
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // WasteCollectionItems
    await queryInterface.bulkInsert('WasteCollectionItems', [
      { waste_collection_id: 1, category_id: 1, estimated_weight: 3.5, actual_weight: 3.5, createdAt: new Date(), updatedAt: new Date() },
      { waste_collection_id: 1, category_id: 2, estimated_weight: 2.0, actual_weight: 2.0, createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Transactions
    await queryInterface.bulkInsert('Transactions', [
      {
        user_id: 2,
        waste_collection_id: 1,
        total_amount: 11000,
        total_weight: 5.5,
        total_points: 7,
        payment_method: 'cash',
        payment_status: 'paid',
        notes: 'Transaksi pertama',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // TransactionItems
    await queryInterface.bulkInsert('TransactionItems', [
      { transaction_id: 1, category_id: 1, weight: 3.5, price_per_kg: 2000, points_earned: 7, subtotal: 7000, createdAt: new Date(), updatedAt: new Date() },
      { transaction_id: 1, category_id: 2, weight: 2.0, price_per_kg: 1500, points_earned: 2, subtotal: 3000, createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Rewards
    await queryInterface.bulkInsert('Rewards', [
      { name: 'Voucher Belanja', description: 'Voucher belanja senilai 10.000', points_required: 1000, stock: 10, image: '', expiry_date: null, is_active: true, createdAt: new Date(), updatedAt: new Date() }
    ]);

    // RewardRedemptions
    await queryInterface.bulkInsert('RewardRedemptions', [
      { user_id: 2, reward_id: 1, points_spent: 1000, status: 'pending', createdAt: new Date(), updatedAt: new Date() }
    ]);

    // WastePrices
    await queryInterface.bulkInsert('WastePrices', [
      { category_id: 1, price_per_kg: 3000, points_per_kg: 30, icon: '🥤', createdAt: new Date(), updatedAt: new Date() }, // Plastik PET
      { category_id: 2, price_per_kg: 2000, points_per_kg: 20, icon: '📦', createdAt: new Date(), updatedAt: new Date() }, // Kertas Kardus
      { category_id: 3, price_per_kg: 5000, points_per_kg: 50, icon: '🍺', createdAt: new Date(), updatedAt: new Date() }, // Botol Kaca
      { category_id: 4, price_per_kg: 8000, points_per_kg: 80, icon: '🥫', createdAt: new Date(), updatedAt: new Date() }  // Kaleng Aluminium
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RewardRedemptions', null, {});
    await queryInterface.bulkDelete('Rewards', null, {});
    await queryInterface.bulkDelete('TransactionItems', null, {});
    await queryInterface.bulkDelete('Transactions', null, {});
    await queryInterface.bulkDelete('WasteCollectionItems', null, {});
    await queryInterface.bulkDelete('WasteCollections', null, {});
    await queryInterface.bulkDelete('WasteCategories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('WastePrices', null, {});
  }
}; 