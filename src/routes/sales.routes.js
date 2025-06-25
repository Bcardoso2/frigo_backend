// src/routes/sales.routes.js
const { Router } = require('express');
const SaleController = require('../controllers/SaleController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

// Boa prática: usar um nome mais específico para o roteador
const salesRouter = new Router();

// Aplica o middleware de autenticação para todas as rotas de vendas
salesRouter.use(ensureAuthenticated);

// Rota para CRIAR uma nova venda (usada pelo PDV)
// POST http://localhost:3333/sales
salesRouter.post('/', SaleController.store);

// --- ROTA ADICIONADA ---
// Rota para LISTAR vendas (usada pela tela de Relatórios, com filtros de data)
// GET http://localhost:3333/sales?startDate=...&endDate=...
salesRouter.get('/', SaleController.index);

// --- ROTA ADICIONADA ---
// Rota para BUSCAR os detalhes de uma única venda por ID
// GET http://localhost:3333/sales/1
salesRouter.get('/:id', SaleController.show);

module.exports = salesRouter;