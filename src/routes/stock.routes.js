const { Router } = require('express');
const StockController = require('../controllers/StockController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const routes = new Router();
routes.use(ensureAuthenticated);

routes.get('/', StockController.index);
routes.post('/transfer', StockController.transfer);

module.exports = routes;