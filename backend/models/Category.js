const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_ar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Category;
