// src/models/Client.js
const { Model, DataTypes } = require('sequelize');

class Client extends Model {
  static init(sequelize) {
    super.init({
      nome: DataTypes.STRING,
      cpf_cnpj: DataTypes.STRING,
      telefone: DataTypes.STRING,
      email: DataTypes.STRING,
      endereco: DataTypes.TEXT,
    }, {
      sequelize,
      tableName: 'clientes',
    });
    return this;
  }

  static associate(models) {
    // Um cliente pode ter muitas vendas
    this.hasMany(models.Sale, { foreignKey: 'cliente_id', as: 'vendas' });
  }
}

module.exports = Client;