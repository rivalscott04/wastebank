const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class TransactionItem extends Model {}

TransactionItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Transactions',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'WasteCategories',
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  points_earned: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'TransactionItem'
});

TransactionItem.associate = (models) => {
  // Associations are defined in models/index.js
};

module.exports = TransactionItem; 