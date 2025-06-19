'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('Users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'nasabah'), defaultValue: 'nasabah' },
      phone: Sequelize.STRING,
      address: Sequelize.TEXT,
      points: { type: Sequelize.INTEGER, defaultValue: 0 },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      gender: { type: Sequelize.ENUM('male', 'female'), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // WasteCategories table
    await queryInterface.createTable('WasteCategories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.TEXT,
      price_per_kg: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      points_per_kg: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // WasteCollections table
    await queryInterface.createTable('WasteCollections', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      pickup_address: { type: Sequelize.TEXT, allowNull: false },
      pickup_date: { type: Sequelize.DATEONLY, allowNull: false },
      pickup_time_slot: { type: Sequelize.ENUM('morning', 'afternoon', 'evening'), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled'), defaultValue: 'pending' },
      notes: Sequelize.TEXT,
      assigned_staff_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' } },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // WasteCollectionItems table
    await queryInterface.createTable('WasteCollectionItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      waste_collection_id: { type: Sequelize.INTEGER, references: { model: 'WasteCollections', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      category_id: { type: Sequelize.INTEGER, references: { model: 'WasteCategories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      estimated_weight: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      actual_weight: { type: Sequelize.DECIMAL(10, 2) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Transactions table
    await queryInterface.createTable('Transactions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      waste_collection_id: { type: Sequelize.INTEGER, references: { model: 'WasteCollections', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_weight: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_points: { type: Sequelize.INTEGER, allowNull: false },
      payment_method: Sequelize.STRING,
      payment_status: { type: Sequelize.ENUM('pending', 'paid', 'cancelled'), defaultValue: 'pending' },
      notes: Sequelize.TEXT,
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // TransactionItems table
    await queryInterface.createTable('TransactionItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      transaction_id: { type: Sequelize.INTEGER, references: { model: 'Transactions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      category_id: { type: Sequelize.INTEGER, references: { model: 'WasteCategories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      weight: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      price_per_kg: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      points_earned: { type: Sequelize.INTEGER, allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Rewards table
    await queryInterface.createTable('Rewards', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.TEXT,
      points_required: { type: Sequelize.INTEGER, allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false },
      image: Sequelize.STRING,
      expiry_date: Sequelize.DATE,
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // RewardRedemptions table
    await queryInterface.createTable('RewardRedemptions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      reward_id: { type: Sequelize.INTEGER, references: { model: 'Rewards', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      points_spent: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'), defaultValue: 'pending' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RewardRedemptions');
    await queryInterface.dropTable('Rewards');
    await queryInterface.dropTable('TransactionItems');
    await queryInterface.dropTable('Transactions');
    await queryInterface.dropTable('WasteCollectionItems');
    await queryInterface.dropTable('WasteCollections');
    await queryInterface.dropTable('WasteCategories');
    await queryInterface.dropTable('Users');
  }
}; 