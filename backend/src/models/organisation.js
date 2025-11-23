const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Organisation = sequelize.define('Organisation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'organisations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Organisation;
