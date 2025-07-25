const sequelize = require('../config/sequelize');
const User = require('./User');
const Reward = require('./Reward');
const RewardRedemption = require('./RewardRedemption');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const WasteCategory = require('./WasteCategory');
const WasteCollection = require('./WasteCollection');
const WasteCollectionItem = require('./WasteCollectionItem');
const WastePrice = require('./WastePrice');

// Associations (if any)
if (typeof Transaction.associate === 'function') Transaction.associate({ User, WasteCollection, TransactionItem });
if (typeof TransactionItem.associate === 'function') TransactionItem.associate({ WasteCategory });
if (typeof WastePrice.associate === 'function') WastePrice.associate({ WasteCategory });
WasteCollection.hasMany(WasteCollectionItem, { foreignKey: 'waste_collection_id', as: 'items' });
WasteCollectionItem.belongsTo(WasteCollection, { foreignKey: 'waste_collection_id', as: 'collection' });
WasteCollectionItem.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });
WasteCategory.hasMany(WasteCollectionItem, { foreignKey: 'category_id', as: 'collectionItems' });
WasteCollection.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(WasteCollection, { foreignKey: 'user_id', as: 'collections' });
WasteCollection.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assignedStaff' });
User.hasMany(WasteCollection, { foreignKey: 'assigned_staff_id', as: 'assignedCollections' });
// Tambahkan associate lain jika ada

module.exports = {
  sequelize,
  User,
  Reward,
  RewardRedemption,
  Transaction,
  TransactionItem,
  WasteCategory,
  WasteCollection,
  WasteCollectionItem,
  WastePrice,
}; 