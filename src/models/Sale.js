// src/models/Sale.js
const { Model, DataTypes } = require('sequelize');

class Sale extends Model {
  static init(sequelize) {
    super.init({
      valor_total: DataTypes.DECIMAL(10, 2),
      forma_pagamento: DataTypes.STRING, // 'DINHEIRO', 'CARTAO_CREDITO', 'PIX'
    }, {
      sequelize,
      tableName: 'vendas',
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'usuario_id', as: 'operador' });
    this.hasMany(models.SaleItem, { foreignKey: 'venda_id', as: 'itens' });
  }
}

module.exports = Sale;