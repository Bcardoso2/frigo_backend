// src/controllers/SaleController.js
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const StockLocation = require('../models/StockLocation');
const CashierSession = require('../models/CashierSession');
const CashierMovement = require('../models/CashierMovement');
const sequelize = require('../database/index').connection;

class SaleController {
  // Registrar uma nova venda
  async store(req, res) {
    const t = await sequelize.transaction(); // Inicia transação

    try {
      const { forma_pagamento, itens } = req.body; // itens = [{ produto_id, quantidade }, ...]
      const usuario_id = req.user.id;

      // 1. Verifica se o caixa está aberto
      const session = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!session) {
        return res.status(400).json({ error: 'Caixa está fechado. Abra o caixa para iniciar vendas.' });
      }
      
      // 2. Valida o estoque de todos os itens ANTES de começar
      const prateleira = await StockLocation.findOne({ where: { nome: 'PRATELEIRA' } });
      let valor_total = 0;

      for (const item of itens) {
        const produto = await Product.findByPk(item.produto_id);
        if(!produto) throw new Error(`Produto com ID ${item.produto_id} não encontrado.`);
        
        const estoquePrateleira = await Stock.findOne({
            where: { produto_id: item.produto_id, local_id: prateleira.id }
        });

        if (!estoquePrateleira || estoquePrateleira.quantidade < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto "${produto.nome}" na prateleira.`);
        }
        valor_total += produto.preco_venda * item.quantidade;
      }
      
      // 3. Cria a Venda
      const sale = await Sale.create({
        usuario_id,
        sessao_caixa_id: session.id,
        valor_total,
        forma_pagamento,
      }, { transaction: t });

      // 4. Cria os Itens da Venda e atualiza o estoque
      for (const item of itens) {
        const produto = await Product.findByPk(item.produto_id, { transaction: t });
        
        await SaleItem.create({
          venda_id: sale.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: produto.preco_venda,
          valor_subtotal: produto.preco_venda * item.quantidade,
        }, { transaction: t });

        // Decrementa estoque da prateleira
        const estoquePrateleira = await Stock.findOne({
          where: { produto_id: item.produto_id, local_id: prateleira.id },
          transaction: t
        });
        estoquePrateleira.quantidade -= item.quantidade;
        await estoquePrateleira.save({ transaction: t });
      }

      // 5. Cria o Movimento de Caixa
      await CashierMovement.create({
        sessao_caixa_id: session.id,
        usuario_id,
        tipo_movimento: 'VENDA',
        valor: valor_total,
        descricao: `Venda #${sale.id}`,
      }, { transaction: t });

      await t.commit(); // Sucesso! Efetiva tudo.
      return res.status(201).json(sale);

    } catch (error) {
      await t.rollback(); // Erro! Desfaz tudo.
      console.error(error);
      return res.status(400).json({ error: error.message || 'Falha ao processar venda.' });
    }
  }
}

module.exports = new SaleController();