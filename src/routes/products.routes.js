const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const routes = new Router();

// Todas as rotas de produto precisam de autenticação
routes.use(ensureAuthenticated);

routes.get('/', ProductController.index);
routes.post('/', ProductController.store);

module.exports = routes;