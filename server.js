// server.js
require('dotenv/config');
const express = require('express');
const cors = require('cors');

// Importa a conexão com o banco de dados (isso inicializa o DB)
require('./src/database');

// Importa o roteador principal
const routes = require('./src/routes'); // Node.js pega o 'index.js' automaticamente

const app = express();

app.use(cors());
app.use(express.json());

// Diz ao Express para usar as rotas que importamos
app.use(routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}. API do Frigo Beef Marajó está no ar!`);
});