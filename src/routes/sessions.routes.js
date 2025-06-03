// src/routes/sessions.routes.js
const { Router } = require('express');
const SessionController = require('../controllers/SessionController');

const routes = new Router();

routes.post('/', SessionController.store); // Chama o método store do controller

module.exports = routes;