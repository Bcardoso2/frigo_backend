// src/models/CashierSession.js
const { Model, DataTypes } = require('sequelize');

class CashierSession extends Model {
  static init(sequelize) {
    super.init({
      // Campos que você já tinha
      valor_abertura: DataTypes.DECIMAL(10, 2),
      valor_fechamento: DataTypes.DECIMAL(10, 2),
      data_abertura: DataTypes.DATE,
      data_fechamento: DataTypes.DATE,
      status: DataTypes.STRING,

      // --- CAMPOS QUE FALTAVAM ADICIONADOS AQUI ---
      usuario_abertura_id: DataTypes.INTEGER,
      usuario_fechamento_id: DataTypes.INTEGER,
      diferenca: DataTypes.DECIMAL(10, 2),

    }, {
      sequelize,
      tableName: 'sessoes_caixa',
    });
    return this;
  }

  static associate(models) {
    // As associações que você já tinha, e que estão corretas.
    this.belongsTo(models.User, { foreignKey: 'usuario_abertura_id', as: 'operador_abertura' });
    this.belongsTo(models.User, { foreignKey: 'usuario_fechamento_id', as: 'operador_fechamento' });
    this.hasMany(models.CashierMovement, { foreignKey: 'sessao_caixa_id', as: 'movimentos' });
  }
}

module.exports = CashierSession;