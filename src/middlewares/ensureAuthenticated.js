// src/middlewares/ensureAuthenticated.js
const { verify } = require('jsonwebtoken');
const authConfig = require('../config/auth');

function ensureAuthenticated(req, res, next) {
  // 1. Receber o token
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  // O token vem no formato "Bearer token". Vamos separar as duas partes.
  const [, token] = authHeader.split(' ');

  try {
    // 2. Validar o token
    const decoded = verify(token, authConfig.secret);

    // 3. Recuperar o ID do usuário de dentro do token e adicionar na requisição
    const { id } = decoded;
    req.user = {
      id,
    };

    return next(); // Se o token for válido, continua para o controller
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = ensureAuthenticated;