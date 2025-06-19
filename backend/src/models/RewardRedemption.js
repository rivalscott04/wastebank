const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

class RewardRedemption extends Model {}

RewardRedemption.init({
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
  reward_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rewards',
      key: 'id'
    }
  },
  points_spent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'RewardRedemption',
  tableName: 'RewardRedemptions'
});

module.exports = RewardRedemption; 