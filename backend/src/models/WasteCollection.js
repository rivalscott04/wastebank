const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class WasteCollection extends Model {}

WasteCollection.init({
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
  pickup_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pickup_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pickup_time_slot: {
    type: DataTypes.ENUM('morning', 'afternoon', 'evening'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: DataTypes.TEXT,
  assigned_staff_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'WasteCollection'
});

module.exports = WasteCollection; 