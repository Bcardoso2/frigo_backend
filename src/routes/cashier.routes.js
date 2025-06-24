// src/routes/cashier.routes.js
const { Router } = require('express');
const CashierController = require('../controllers/CashierController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const cashierRouter = new Router();

cashierRouter.use(ensureAuthenticated);

// --- ROTAS DE CONSULTA ---
cashierRouter.get('/status', CashierController.status);
cashierRouter.get('/status/movements', CashierController.showActiveSessionMovements);

// --- ROTA QUE PRECISAMOS GARANTIR QUE EXISTA ---
cashierRouter.get('/status/sales', CashierController.showActiveSessionSales); 


// --- ROTAS DE AÇÃO ---
cashierRouter.post('/open', CashierController.open);
cashierRouter.post('/bleed', CashierController.bleed);
cashierRouter.post('/close', CashierController.close);

module.exports = cashierRouter;