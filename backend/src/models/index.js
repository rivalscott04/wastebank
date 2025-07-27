const sequelize = require('../config/sequelize');
const User = require('./User');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const WasteCategory = require('./WasteCategory');
const WasteCollection = require('./WasteCollection');
const WasteCollectionItem = require('./WasteCollectionItem');
const WastePrice = require('./WastePrice');

// Associations (if any)
WasteCollection.hasMany(WasteCollectionItem, { foreignKey: 'waste_collection_id', as: 'items', onDelete: 'CASCADE' });
WasteCollectionItem.belongsTo(WasteCollection, { foreignKey: 'waste_collection_id', as: 'collection' });
WasteCollectionItem.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });
WasteCategory.hasMany(WasteCollectionItem, { foreignKey: 'category_id', as: 'collectionItems' });
WasteCollection.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(WasteCollection, { foreignKey: 'user_id', as: 'collections' });
WasteCollection.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assignedStaff' });
User.hasMany(WasteCollection, { foreignKey: 'assigned_staff_id', as: 'assignedCollections' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'transactionUser' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(WasteCollection, { foreignKey: 'waste_collection_id', as: 'waste_collection' });
WasteCollection.hasOne(Transaction, { foreignKey: 'waste_collection_id', as: 'transaction' });
Transaction.hasMany(TransactionItem, { foreignKey: 'transaction_id', as: 'items', onDelete: 'CASCADE' });
TransactionItem.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
TransactionItem.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'transactionCategory' });
WasteCategory.hasMany(TransactionItem, { foreignKey: 'category_id', as: 'transactionItems' });

// WastePrice associations
WastePrice.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });
WasteCategory.hasMany(WastePrice, { foreignKey: 'category_id', as: 'prices' });

// Tambahkan associate lain jika ada

module.exports = {
  sequelize,
  User,
  Transaction,
  TransactionItem,
  WasteCategory,
  WasteCollection,
  WasteCollectionItem,
  WastePrice,
}; 