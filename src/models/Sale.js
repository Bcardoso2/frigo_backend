// src/models/Sale.js
const { Model, DataTypes } = require('sequelize');

class Sale extends Model {
  static init(sequelize) {
    super.init({
      valor_total: DataTypes.DECIMAL(10, 2),
      forma_pagamento: DataTypes.STRING,
      // Garante que todas as chaves estrangeiras estão declaradas
      usuario_id: DataTypes.INTEGER,
      sessao_caixa_id: DataTypes.INTEGER,
      cliente_id: DataTypes.INTEGER,
    }, {
      sequelize,
      tableName: 'vendas',
    });
    return this;
  }

  // --- MÉTODO DE ASSOCIAÇÃO COMPLETO ---
  // Garante que todas as "pontes" para outras tabelas estão declaradas
  static associate(models) {
    // Uma venda pertence a um Operador (User)
    this.belongsTo(models.User, { foreignKey: 'usuario_id', as: 'operador' });
    
    // Uma venda pertence a uma Sessão de Caixa
    this.belongsTo(models.CashierSession, { foreignKey: 'sessao_caixa_id', as: 'sessao' });
    
    // Uma venda pertence a um Cliente
    this.belongsTo(models.Client, { foreignKey: 'cliente_id', as: 'cliente' });
    
    // Uma venda tem muitos Itens de Venda
    this.hasMany(models.SaleItem, { foreignKey: 'venda_id', as: 'itens' });
  }
}

module.exports = Sale;