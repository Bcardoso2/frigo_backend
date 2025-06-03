// src/models/SaleItem.js
const { Model, DataTypes } = require('sequelize');

class SaleItem extends Model {
  static init(sequelize) {
    super.init({
      quantidade: DataTypes.DECIMAL(10, 3),
      preco_unitario: DataTypes.DECIMAL(10, 2),
      valor_subtotal: DataTypes.DECIMAL(10, 2),
    }, {
      sequelize,
      tableName: 'vendas_itens',
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Sale, { foreignKey: 'venda_id', as: 'venda' });
    this.belongsTo(models.Product, { foreignKey: 'produto_id', as: 'produto' });
  }
}

module.exports = SaleItem;