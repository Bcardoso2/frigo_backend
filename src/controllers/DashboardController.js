const { Op, fn, col, literal } = require('sequelize');
const Product = require('../models/Product');
const Client = require('../models/Client');
const CashierSession = require('../models/CashierSession');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const User = require('../models/User');

class DashboardController {
  async getFullDashboardStats(req, res) {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      // 1. Indicadores principais (os que já tínhamos)
      const productCount = await Product.count();
      const clientCount = await Client.count();
      const activeSession = await CashierSession.findOne({ where: { status: 'ABERTO' } });

      const todaySales = await Sale.sum('valor_total', {
        where: { createdAt: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } },
      });

      // 2. Dados para o gráfico de vendas dos últimos 7 dias
      const salesOverTime = await Sale.findAll({
        attributes: [
          [fn('date', col('created_at')), 'sale_date'],
          [fn('sum', col('valor_total')), 'total_sales'],
        ],
        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
        group: [fn('date', col('created_at'))],
        order: [[fn('date', col('created_at')), 'ASC']],
        raw: true,
      });

      // 3. Dados para o ranking de produtos mais vendidos
      const topProducts = await SaleItem.findAll({
        attributes: [
            'produto_id',
            [fn('SUM', col('quantidade')), 'total_quantity'],
        ],
        group: ['produto_id', 'produto.id', 'produto.nome'],
        order: [[literal('total_quantity'), 'DESC']],
        limit: 5,
        include: [{ model: Product, as: 'produto', attributes: ['nome'] }]
      });

      // 4. Dados para a lista de atividades recentes
      const recentSales = await Sale.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Client, as: 'cliente', attributes: ['nome'] },
          { model: User, as: 'operador', attributes: ['nome'] },
        ]
      });

      // Monta o objeto de resposta completo
      const stats = {
        productCount,
        clientCount,
        cashierStatus: activeSession ? 'Aberto' : 'Fechado',
        todaySales: todaySales || 0,
        salesOverTime,
        topProducts,
        recentSales,
      };

      return res.json(stats);
    } catch (error) {
      console.error("ERRO AO GERAR ESTATÍSTICAS DO DASHBOARD:", error);
      return res.status(500).json({ error: 'Falha ao gerar estatísticas.' });
    }
  }
}

module.exports = new DashboardController();
