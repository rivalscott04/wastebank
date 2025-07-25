const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class WasteCategory extends Model {}

WasteCategory.init({
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
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  points_per_kg: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'WasteCategory'
});

module.exports = WasteCategory; 