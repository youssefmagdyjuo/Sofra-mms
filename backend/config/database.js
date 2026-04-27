const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mms_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
