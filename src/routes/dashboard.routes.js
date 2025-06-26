const { Router } = require('express');
const DashboardController = require('../controllers/DashboardController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const dashboardRouter = new Router();
dashboardRouter.use(ensureAuthenticated);

// Rota única que retorna todos os dados para o dashboard
dashboardRouter.get('/full-stats', DashboardController.getFullDashboardStats);

module.exports = dashboardRouter;
