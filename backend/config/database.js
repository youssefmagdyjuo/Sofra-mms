const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dialectOptions = process.env.DB_HOST && process.env.DB_HOST.includes('aiven') ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : undefined;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mms_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions
  }
);

module.exports = sequelize;
