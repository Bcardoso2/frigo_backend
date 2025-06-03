// src/routes/cashier.routes.js
const { Router } = require('express');
const CashierController = require('../controllers/CashierController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const routes = new Router();
routes.use(ensureAuthenticated);

routes.get('/status', CashierController.status); // <-- ADICIONE ESTA LINHA
routes.post('/open', CashierController.open);
routes.post('/bleed', CashierController.bleed);

module.exports = routes;