// src/controllers/SessionController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth'); // Precisaremos da chave secreta

class SessionController {
  async store(req, res) {
    try {
      const { email, senha } = req.body;

      // 1. Verifica se o usuário existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      // 2. Verifica se a senha está correta
      // (O método checkPassword foi criado no Model User.js)
      if (!(await user.checkPassword(senha))) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      const { id, nome, cargo } = user;

      // 3. Se tudo estiver certo, gera o Token JWT
      const token = jwt.sign({ id, nome, cargo }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      // Retorna os dados do usuário e o token
      return res.json({
        user: {
          id,
          nome,
          email,
          cargo,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Falha no login, tente novamente.' });
    }
  }
}

module.exports = new SessionController();