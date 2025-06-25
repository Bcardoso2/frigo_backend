// src/controllers/SaleController.js
const { Op } = require('sequelize');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const StockLocation = require('../models/StockLocation');
const CashierSession = require('../models/CashierSession');
const CashierMovement = require('../models/CashierMovement');
const Client = require('../models/Client');
const User = require('../models/User');
const sequelize = require('../database/index').connection;

class SaleController {
  
  /**
   * Listar todas as vendas, com filtro opcional por data e hora.
   * Usado na tela de Relatórios.
   */
  async index(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};

      if (startDate && endDate) {
        // new Date() interpreta a string de data e hora completa enviada pelo frontend
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const sales = await Sale.findAll({
        where: whereClause,
        include: [
          { model: Client, as: 'cliente', attributes: ['nome'] },
          { model: User, as: 'operador', attributes: ['nome'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json(sales);
    } catch (error) {
      console.error("ERRO AO LISTAR VENDAS:", error);
      return res.status(500).json({ error: 'Falha ao listar vendas.' });
    }
  }

  /**
   * Buscar uma única venda por ID, com todos os seus detalhes.
   * Útil para futuras telas de "Detalhes da Venda".
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const sale = await Sale.findByPk(id, {
        include: [
          { model: Client, as: 'cliente' },
          { model: User, as: 'operador', attributes: ['id', 'nome'] },
          {
            model: SaleItem,
            as: 'itens',
            include: [{ model: Product, as: 'produto', attributes: ['nome', 'unidade_medida'] }]
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada.' });
      }

      return res.json(sale);
    } catch (error) {
      console.error(`ERRO AO BUSCAR VENDA #${req.params.id}:`, error);
      return res.status(500).json({ error: 'Falha ao buscar detalhes da venda.' });
    }
  }

  /**
   * Registrar uma nova venda.
   * Usado na tela de Ponto de Venda (PDV).
   */
  async store(req, res) {
    const t = await sequelize.transaction();

    try {
      const { 
        forma_pagamento, 
        itens,
        cliente_id, 
        funcionario_crediario_nome, 
        taxa_crediario 
      } = req.body;
      
      const usuario_id = req.user.id;

      const session = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!session) {
        await t.rollback();
        return res.status(400).json({ error: 'Caixa está fechado. Abra o caixa para iniciar vendas.' });
      }
      
      const prateleira = await StockLocation.findOne({ where: { nome: 'PRATELEIRA' } });
      if (!prateleira) {
          throw new Error("Local 'PRATELEIRA' não encontrado. Verifique a configuração inicial.");
      }

      for (const item of itens) {
        const produto = await Product.findByPk(item.produto_id);
        if(!produto) throw new Error(`Produto com ID ${item.produto_id} não encontrado.`);
        
        const estoquePrateleira = await Stock.findOne({
            where: { produto_id: item.produto_id, local_id: prateleira.id }
        });

        if (!estoquePrateleira || estoquePrateleira.quantidade < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto "${produto.nome}" na prateleira.`);
        }
      }
      
      const valor_total = itens.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0);

      const sale = await Sale.create({
        usuario_id,
        sessao_caixa_id: session.id,
        valor_total,
        forma_pagamento,
        cliente_id: cliente_id || null,
        funcionario_crediario_nome: funcionario_crediario_nome || null,
        taxa_crediario: taxa_crediario || null,
      }, { transaction: t });

      for (const item of itens) {
        const estoquePrateleira = await Stock.findOne({
          where: { produto_id: item.produto_id, local_id: prateleira.id },
          transaction: t
        });
        estoquePrateleira.quantidade -= item.quantidade;
        await estoquePrateleira.save({ transaction: t });

        await SaleItem.create({
          venda_id: sale.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          valor_subtotal: item.quantidade * item.preco_unitario,
        }, { transaction: t });
      }

      await CashierMovement.create({
        sessao_caixa_id: session.id,
        usuario_id,
        tipo_movimento: 'VENDA',
        valor: valor_total,
        descricao: `Venda #${sale.id}`,
      }, { transaction: t });

      await t.commit();
      return res.status(201).json(sale);

    } catch (error) {
      await t.rollback();
      console.error("ERRO AO FINALIZAR VENDA:", error);
      return res.status(400).json({ error: error.message || 'Falha ao processar venda.' });
    }
  }
}

module.exports = new SaleController();