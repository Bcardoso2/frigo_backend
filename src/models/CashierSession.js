// src/models/CashierSession.js
const { Model, DataTypes } = require('sequelize');

class CashierSession extends Model {
  static init(sequelize) {
    super.init({
      valor_abertura: DataTypes.DECIMAL(10, 2),
      valor_fechamento: DataTypes.DECIMAL(10, 2),
      data_abertura: DataTypes.DATE,
      data_fechamento: DataTypes.DATE,
      status: DataTypes.STRING, // 'ABERTO', 'FECHADO'
    }, {
      sequelize,
      tableName: 'sessoes_caixa',
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'usuario_abertura_id', as: 'operador_abertura' });
    this.belongsTo(models.User, { foreignKey: 'usuario_fechamento_id', as: 'operador_fechamento' });
    this.hasMany(models.CashierMovement, { foreignKey: 'sessao_caixa_id', as: 'movimentos' });
  }
}

module.exports = CashierSession;