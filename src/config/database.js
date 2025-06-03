// src/config/database.js
require('dotenv/config'); // ESSA LINHA É FUNDAMENTAL AQUI

module.exports = {
  dialect: 'mysql', // O Sequelize precisa saber que é mysql
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};