// src/models/Stock.js
const { Model, DataTypes } = require('sequelize');

class Stock extends Model {
  static init(sequelize) {
    super.init({
      quantidade: DataTypes.DECIMAL(10, 3),
    }, {
      sequelize,
      tableName: 'estoque',
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Product, { foreignKey: 'produto_id', as: 'produto' });
    this.belongsTo(models.StockLocation, { foreignKey: 'local_id', as: 'local' });
  }
}

module.exports = Stock;