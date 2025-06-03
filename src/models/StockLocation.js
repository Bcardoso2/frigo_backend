// src/models/StockLocation.js
const { Model, DataTypes } = require('sequelize');

class StockLocation extends Model {
  static init(sequelize) {
    super.init({
      nome: DataTypes.STRING,
      descricao: DataTypes.TEXT,
    }, {
      sequelize,
      tableName: 'locais_estoque',
    });
    return this;
  }
}

module.exports = StockLocation;