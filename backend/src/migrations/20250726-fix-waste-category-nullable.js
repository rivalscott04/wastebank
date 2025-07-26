'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ubah constraint untuk price_per_kg dan points_per_kg menjadi nullable
    await queryInterface.changeColumn('WasteCategories', 'price_per_kg', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.changeColumn('WasteCategories', 'points_per_kg', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    console.log('✅ WasteCategory columns updated to nullable');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: ubah kembali menjadi not null
    await queryInterface.changeColumn('WasteCategories', 'price_per_kg', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    await queryInterface.changeColumn('WasteCategories', 'points_per_kg', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    console.log('❌ WasteCategory columns reverted to not null');
  }
}; 