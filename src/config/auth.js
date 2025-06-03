// src/config/auth.js
require('dotenv/config'); // Essencial para carregar a variável do .env

module.exports = {
  // Chave secreta usada para assinar e validar os tokens.
  // Ela NUNCA deve ser exposta publicamente.
  secret: process.env.APP_SECRET,

  // Configuração de quanto tempo o token será válido.
  expiresIn: '7d', // '7d' = 7 dias. Você pode usar '1h', '30m', etc.
};