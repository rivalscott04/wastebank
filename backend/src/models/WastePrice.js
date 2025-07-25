const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class WastePrice extends Model {}

WastePrice.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'WasteCategories',
      key: 'id'
    }
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  points_per_kg: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'WastePrice',
  tableName: 'WastePrices'
});

WastePrice.associate = (models) => {
  // Associations are defined in models/index.js
};

module.exports = WastePrice; 