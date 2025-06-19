const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class Transaction extends Model {}

Transaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  waste_collection_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'WasteCollections',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'e-wallet'),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: DataTypes.TEXT
}, {
  sequelize,
  modelName: 'Transaction'
});

module.exports = Transaction; 