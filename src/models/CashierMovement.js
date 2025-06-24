// src/models/CashierMovement.js
const { Model, DataTypes } = require('sequelize');

class CashierMovement extends Model {
  static init(sequelize) {
    super.init({
      tipo_movimento: DataTypes.STRING,
      valor: DataTypes.DECIMAL(10, 2),
      descricao: DataTypes.TEXT,
      // --- CAMPOS DE CHAVE ESTRANGEIRA ADICIONADOS AQUI ---
      sessao_caixa_id: DataTypes.INTEGER,
      usuario_id: DataTypes.INTEGER,
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