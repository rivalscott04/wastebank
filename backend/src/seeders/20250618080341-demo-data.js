'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create default admin user
    const adminUser = await queryInterface.bulkInsert('Users', [{
      name: 'Admin',
      email: 'admin@wastebank.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      phone: '081234567890',
      address: 'Jl. Admin No. 1',
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    // Create sample nasabah users
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'nasabah',
        phone: '081234567891',
        address: 'Jl. Mawar No. 10, RT 01/RW 02, Kelurahan Sukamaju',
        points: 1500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Siti Rahayu',
        email: 'siti@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'nasabah',
        phone: '081234567892',
        address: 'Jl. Melati No. 15, RT 03/RW 04, Kelurahan Sukajadi',
        points: 2500,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ahmad Hidayat',
        email: 'ahmad@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'nasabah',
        phone: '081234567893',
        address: 'Jl. Anggrek No. 20, RT 02/RW 03, Kelurahan Sukapura',
        points: 3000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dewi Lestari',
        email: 'dewi@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'nasabah',
        phone: '081234567894',
        address: 'Jl. Dahlia No. 25, RT 04/RW 05, Kelurahan Sukamulya',
        points: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create waste categories
    const categories = await queryInterface.bulkInsert('WasteCategories', [
      {
        name: 'Botol Plastik',
        description: 'Botol plastik bekas minuman',
        price_per_kg: 5000,
        points_per_kg: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kardus',
        description: 'Kardus bekas packaging',
        price_per_kg: 3000,
        points_per_kg: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kertas',
        description: 'Kertas bekas, koran, majalah',
        price_per_kg: 2500,
        points_per_kg: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kaleng',
        description: 'Kaleng aluminium bekas minuman',
        price_per_kg: 10000,
        points_per_kg: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Create sample waste collections
    await queryInterface.bulkInsert('WasteCollections', [
      {
        user_id: 2, // Budi
        pickup_address: 'Jl. Mawar No. 10, RT 01/RW 02, Kelurahan Sukamaju',
        pickup_date: new Date(new Date().setDate(new Date().getDate() + 1)),
        pickup_time_slot: 'morning',
        status: 'pending',
        notes: 'Ada 3 karung sampah',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3, // Siti
        pickup_address: 'Jl. Melati No. 15, RT 03/RW 04, Kelurahan Sukajadi',
        pickup_date: new Date(new Date().setDate(new Date().getDate() + 2)),
        pickup_time_slot: 'afternoon',
        status: 'confirmed',
        assigned_staff_id: 1, // Admin
        notes: 'Tolong datang sebelum jam 2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4, // Ahmad
        pickup_address: 'Jl. Anggrek No. 20, RT 02/RW 03, Kelurahan Sukapura',
        pickup_date: new Date(),
        pickup_time_slot: 'evening',
        status: 'completed',
        assigned_staff_id: 1, // Admin
        notes: 'Sampah sudah dipilah',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date()
      }
    ]);

    // Create sample transactions
    const transaction = await queryInterface.bulkInsert('Transactions', [
      {
        user_id: 4, // Ahmad
        total_amount: 50000,
        total_points: 500,
        payment_method: 'cash',
        payment_status: 'completed',
        notes: 'Transaksi pertama',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    ], { returning: true });

    // Create transaction items
    await queryInterface.bulkInsert('TransactionItems', [
      {
        transaction_id: 1,
        category_id: 1, // Botol Plastik
        weight: 5.5,
        price_per_kg: 5000,
        points_earned: 275,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 1))
      },
      {
        transaction_id: 1,
        category_id: 2, // Kardus
        weight: 7.5,
        price_per_kg: 3000,
        points_earned: 225,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    ]);

    // Create sample rewards
    await queryInterface.bulkInsert('Rewards', [
      {
        name: 'Voucher Pulsa 10rb',
        description: 'Voucher pulsa senilai Rp 10.000',
        points_required: 1000,
        stock: 100,
        expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Voucher Belanja 50rb',
        description: 'Voucher belanja senilai Rp 50.000',
        points_required: 5000,
        stock: 50,
        expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Powerbank 10000mAh',
        description: 'Powerbank kapasitas 10000mAh',
        points_required: 10000,
        stock: 20,
        expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create sample reward redemptions
    await queryInterface.bulkInsert('RewardRedemptions', [
      {
        user_id: 3, // Siti
        reward_id: 1, // Voucher Pulsa
        points_spent: 1000,
        status: 'completed',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 2))
      },
      {
        user_id: 4, // Ahmad
        reward_id: 2, // Voucher Belanja
        points_spent: 5000,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded data in reverse order
    await queryInterface.bulkDelete('RewardRedemptions', null, {});
    await queryInterface.bulkDelete('Rewards', null, {});
    await queryInterface.bulkDelete('TransactionItems', null, {});
    await queryInterface.bulkDelete('Transactions', null, {});
    await queryInterface.bulkDelete('WasteCollections', null, {});
    await queryInterface.bulkDelete('WasteCategories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
