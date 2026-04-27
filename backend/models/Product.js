const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
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
  description_en: {
    type: DataTypes.TEXT,
  },
  description_ar: {
    type: DataTypes.TEXT,
  },
  price_staff: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_guest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

module.exports = Product;
