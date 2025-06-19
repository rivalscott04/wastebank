const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class WasteCollectionItem extends Model {}

WasteCollectionItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  waste_collection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'WasteCollections',
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
  estimated_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  actual_weight: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  sequelize,
  modelName: 'WasteCollectionItem'
});

module.exports = WasteCollectionItem; 