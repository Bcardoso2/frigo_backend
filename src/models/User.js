// src/models/User.js
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init({
      // Colunas reais do banco de dados
      nome: DataTypes.STRING,
      email: DataTypes.STRING,
      senha_hash: DataTypes.STRING,
      cargo: DataTypes.STRING,
      ativo: DataTypes.BOOLEAN,

      // --- CAMPO VIRTUAL ADICIONADO AQUI ---
      // Este campo 'senha' não existe no banco. Ele só serve para
      // receber a senha do controller e ser usado pelo hook.
      senha: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

    }, {
      sequelize,
      tableName: 'usuarios',
    });

    // Hook do Sequelize que é executado antes de um registro ser salvo
    this.addHook('beforeSave', async (user) => {
      // Se a senha (virtual) foi informada, criptografa e preenche o senha_hash
      if (user.senha) {
        user.senha_hash = await bcrypt.hash(user.senha, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Sale, { foreignKey: 'usuario_id', as: 'vendas' });
    this.hasMany(models.CashierSession, { foreignKey: 'usuario_abertura_id', as: 'sessoes_abertas' });
    this.hasMany(models.CashierSession, { foreignKey: 'usuario_fechamento_id', as: 'sessoes_fechadas' });
  }

  checkPassword(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

module.exports = User;