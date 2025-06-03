// src/models/CashierMovement.js
const { Model, DataTypes } = require('sequelize');

class CashierMovement extends Model {
  static init(sequelize) {
    super.init({
      tipo_movimento: DataTypes.STRING, // 'ABERTURA', 'VENDA', 'SANGRIA', 'SUPRIMENTO'
      valor: DataTypes.DECIMAL(10, 2),
      descricao: DataTypes.TEXT,
    }, {
      sequelize,
      tableName: 'movimentos_caixa',
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'usuario_id', as: 'usuario' });
    this.belongsTo(models.CashierSession, { foreignKey: 'sessao_caixa_id', as: 'sessao' });
  }
}

module.exports = CashierMovement;