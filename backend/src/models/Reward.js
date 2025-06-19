const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class Reward extends Model {}

Reward.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  points_required: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  image: DataTypes.STRING,
  expiry_date: DataTypes.DATE,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Reward'
});

module.exports = Reward; 