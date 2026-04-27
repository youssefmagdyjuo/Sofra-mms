const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');

module.exports = {
  sequelize,
  User,
  Category,
  Product,
};
