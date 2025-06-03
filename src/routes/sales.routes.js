const { Router } = require('express');
const SaleController = require('../controllers/SaleController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const routes = new Router();
routes.use(ensureAuthenticated);

routes.post('/', SaleController.store);

module.exports = routes;