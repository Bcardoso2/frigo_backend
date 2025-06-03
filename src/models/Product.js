// src/models/Product.js
const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static init(sequelize) {
    super.init({
      nome: DataTypes.STRING,
      // preco_venda já existe
      preco_venda: DataTypes.DECIMAL(10, 2),
      unidade_medida: DataTypes.STRING,
      // --- NOVOS CAMPOS ADICIONADOS ---
      preco_custo: DataTypes.DECIMAL(10, 2),
      codigo_referencia: DataTypes.STRING,
      grupo: DataTypes.STRING,
      fabricante: DataTypes.STRING,
      departamento: DataTypes.STRING,
    }, {
      sequelize,
      tableName: 'produtos',
    });
    return this;
  }
  // associação com Stock não muda
  static associate(models) {
    this.hasMany(models.Stock, { foreignKey: 'produto_id', as: 'estoque' });
  }
}

module.exports = Product;