const User = require('./User');
const WasteCategory = require('./WasteCategory');
const WasteCollection = require('./WasteCollection');
const WasteCollectionItem = require('./WasteCollectionItem');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const Reward = require('./Reward');
const RewardRedemption = require('./RewardRedemption');
const WastePrice = require('./WastePrice');

// Define associations after all models are loaded
const defineAssociations = () => {
  // User associations
  User.hasMany(WasteCollection, { foreignKey: 'user_id', as: 'collections' });
  User.hasMany(WasteCollection, { foreignKey: 'assigned_staff_id', as: 'assignedCollections' });
  User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
  User.hasMany(RewardRedemption, { foreignKey: 'user_id', as: 'redemptions' });

  // WasteCollection associations
  WasteCollection.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  WasteCollection.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assignedStaff' });
  WasteCollection.hasMany(WasteCollectionItem, { foreignKey: 'waste_collection_id', as: 'items' });
  WasteCollection.hasOne(Transaction, { foreignKey: 'waste_collection_id', as: 'transaction' });

  // WasteCategory associations
  WasteCategory.hasMany(WasteCollectionItem, { foreignKey: 'category_id', as: 'collectionItems' });
  WasteCategory.hasMany(TransactionItem, { foreignKey: 'category_id', as: 'transactionItems' });

  // WasteCollectionItem associations
  WasteCollectionItem.belongsTo(WasteCollection, { foreignKey: 'waste_collection_id', as: 'collection' });
  WasteCollectionItem.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });

  // Transaction associations
  Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Transaction.belongsTo(WasteCollection, { foreignKey: 'waste_collection_id', as: 'collection' });
  Transaction.hasMany(TransactionItem, { foreignKey: 'transaction_id', as: 'items' });

  // TransactionItem associations
  TransactionItem.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
  TransactionItem.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });

  // Reward associations
  Reward.hasMany(RewardRedemption, { foreignKey: 'reward_id', as: 'redemptions' });

  // RewardRedemption associations
  RewardRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  RewardRedemption.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });

  // WastePrice associations
  WastePrice.belongsTo(WasteCategory, { foreignKey: 'category_id', as: 'category' });
};

// Call defineAssociations after models are initialized
defineAssociations();

module.exports = {
  User,
  WasteCategory,
  WasteCollection,
  WasteCollectionItem,
  Transaction,
  TransactionItem,
  Reward,
  RewardRedemption,
  WastePrice
}; 