// src/controllers/UserController.js
const User = require('../models/User');

class UserController {
  async store(req, res) {
    try {
      const { nome, email, senha, cargo } = req.body;

      // Verifica se o email já está em uso
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      // Cria o usuário no banco de dados.
      // O campo 'senha' virtual será pego pelo hook no Model e criptografado.
      const { id, nome: nomeUsuario, cargo: cargoUsuario, ativo } = await User.create({
        nome,
        email,
        senha, // Este é o campo virtual
        cargo,
      });
      
      // Retorna apenas os dados seguros do usuário
      return res.status(201).json({
        id,
        nome: nomeUsuario,
        email,
        cargo: cargoUsuario,
        ativo,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao criar usuário.' });
    }
  }
}

module.exports = new UserController();