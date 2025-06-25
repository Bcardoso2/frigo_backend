// src/routes/clients.routes.js
const { Router } = require('express');
const ClientController = require('../controllers/ClientController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const clientsRouter = new Router();
clientsRouter.use(ensureAuthenticated);

clientsRouter.post('/', ClientController.store);
clientsRouter.get('/', ClientController.index);
clientsRouter.put('/:id', ClientController.update);

module.exports = clientsRouter;