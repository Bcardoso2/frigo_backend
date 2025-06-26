// src/routes/index.js
const { Router } = require('express');

// Importa todos os roteadores da aplicação
const sessionsRouter = require('./sessions.routes');
const usersRouter = require('./users.routes');
const productsRouter = require('./products.routes');
const stockRouter = require('./stock.routes');
const cashierRouter = require('./cashier.routes');
const salesRouter = require('./sales.routes');
const clientsRouter = require('./clients.routes');
const dashboardRouter = require('./dashboard.routes'); // <-- IMPORTE


const routes = Router();

// Define a rota base para cada conjunto de funcionalidades
routes.use('/sessions', sessionsRouter);
routes.use('/users', usersRouter);
routes.use('/products', productsRouter);
routes.use('/stock', stockRouter);
routes.use('/cashier', cashierRouter);
routes.use('/sales', salesRouter);
routes.use('/clients', clientsRouter); // <-- REGISTRA AS ROTAS DE CLIENTES
routes.use('/dashboard-data', dashboardRouter); // <-- REGISTRE com um prefixo, ex: /dashboard-data


module.exports = routes;