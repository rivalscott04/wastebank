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
  description: DataTypes.TEXT
}, {
  sequelize,
  modelName: 'WasteCategory'
});

module.exports = WasteCategory; 