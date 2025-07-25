'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing transactions with null payment_status to 'completed'
    await queryInterface.sequelize.query(`
      UPDATE Transactions 
      SET payment_status = 'completed' 
      WHERE payment_status IS NULL OR payment_status = ''
    `);
    
    // Modify the payment_status column to ensure it's not null
    await queryInterface.changeColumn('Transactions', 'payment_status', {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Transactions', 'payment_status', {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      allowNull: true,
      defaultValue: 'pending'
    });
  }
}; 