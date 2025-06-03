// src/routes/users.routes.js
const { Router } = require('express');
const UserController = require('../controllers/UserController');

const routes = new Router();

routes.post('/', UserController.store); // Chama o método store do controller

module.exports = routes;