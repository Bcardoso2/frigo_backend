// src/routes/clients.routes.js
const { Router } = require('express');
const ClientController = require('../controllers/ClientController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const clientsRouter = new Router();
clientsRouter.use(ensureAuthenticated);

// Rotas de CRUD de Clientes (o que você já tinha)
clientsRouter.post('/', ClientController.store);
clientsRouter.get('/', ClientController.index);
clientsRouter.put('/:id', ClientController.update);

// --- ROTA NOVA PARA O HISTÓRICO DE COMPRAS ---
// Exemplo de URL: GET http://localhost:3333/clients/1/sales
clientsRouter.get('/:id/sales', ClientController.showSales);


module.exports = clientsRouter;