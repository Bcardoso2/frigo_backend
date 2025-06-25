// src/controllers/CashierController.js
const CashierSession = require('../models/CashierSession');
const CashierMovement = require('../models/CashierMovement');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Client = require('../models/Client');
const { Op } = require('sequelize');
const sequelize = require('../database/index').connection;

class CashierController {

  // ... (os métodos status, open, bleed, showActiveSessionSales, showActiveSessionMovements continuam os mesmos)

  async status(req, res) {
    try {
      const activeSession = await CashierSession.findOne({
        where: { status: 'ABERTO' },
        include: [{ model: User, as: 'operador_abertura', attributes: ['nome'] }],
      });
      return res.json(activeSession);
    } catch (error) {
      console.error("ERRO AO BUSCAR STATUS DO CAIXA:", error);
      return res.status(500).json({ error: 'Falha ao buscar status do caixa.' });
    }
  }

  async open(req, res) {
    try {
      const { valor_abertura } = req.body;
      const usuario_id = req.user.id;
      const openSession = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (openSession) {
        return res.status(400).json({ error: 'Já existe um caixa aberto.' });
      }
      const session = await CashierSession.create({
        usuario_abertura_id: usuario_id,
        valor_abertura,
        status: 'ABERTO',
      });
      await CashierMovement.create({
        sessao_caixa_id: session.id,
        usuario_id,
        tipo_movimento: 'ABERTURA',
        valor: valor_abertura,
      });
      const fullSessionData = await CashierSession.findByPk(session.id, {
        include: [{ model: User, as: 'operador_abertura', attributes: ['nome'] }]
      });
      return res.status(201).json(fullSessionData);
    } catch (error) {
      console.error("ERRO AO ABRIR O CAIXA:", error);
      return res.status(500).json({ error: 'Falha ao abrir o caixa.' });
    }
  }

  async bleed(req, res) {
    try {
      const { valor, descricao } = req.body;
      const usuario_id = req.user.id;
      const session = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!session) {
        return res.status(400).json({ error: 'Nenhum caixa aberto para realizar sangria.' });
      }
      const movement = await CashierMovement.create({
        sessao_caixa_id: session.id,
        usuario_id,
        tipo_movimento: 'SANGRIA',
        valor: -valor,
        descricao,
      });
      return res.json(movement);
    } catch (error) {
      console.error("ERRO AO REALIZAR SANGRIA:", error);
      return res.status(500).json({ error: 'Falha ao realizar sangria.' });
    }
  }

  async showActiveSessionSales(req, res) {
    try {
      const activeSession = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!activeSession) return res.json([]); 
      const sales = await Sale.findAll({
        where: { sessao_caixa_id: activeSession.id },
        include: [
          { model: Client, as: 'cliente', attributes: ['nome'] },
          { model: User, as: 'operador', attributes: ['nome'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(sales);
    } catch (error) {
      console.error("ERRO AO BUSCAR VENDAS DA SESSÃO:", error);
      return res.status(500).json({ error: 'Falha ao buscar vendas da sessão.' });
    }
  }

  async showActiveSessionMovements(req, res) {
    try {
      const activeSession = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!activeSession) return res.json([]);
      const movements = await CashierMovement.findAll({
        where: { sessao_caixa_id: activeSession.id },
        order: [['createdAt', 'ASC']]
      });
      return res.json(movements);
    } catch (error) {
      console.error("ERRO AO BUSCAR MOVIMENTOS:", error);
      return res.status(500).json({ error: 'Falha ao buscar movimentos do caixa.' });
    }
  }

  // --- MÉTODO 'CLOSE' FINAL E CORRIGIDO ---
  async close(req, res) {
    const t = await CashierSession.sequelize.transaction();
    try {
      const { valor_final_informado } = req.body;
      if (valor_final_informado === undefined || valor_final_informado === null) {
        return res.status(400).json({ error: 'O valor final informado é obrigatório.' });
      }

      const session = await CashierSession.findOne({ where: { status: 'ABERTO' }, transaction: t });
      if (!session) {
        await t.rollback();
        return res.status(400).json({ error: 'Nenhum caixa aberto para fechar.' });
      }
      
      // Busca os movimentos para o cálculo geral
      const movements = await CashierMovement.findAll({
        where: { sessao_caixa_id: session.id },
        transaction: t,
      });

      // --- AJUSTE PRINCIPAL: BUSCA AS VENDAS PARA DETALHAR POR PAGAMENTO ---
      const sales = await Sale.findAll({
        where: { sessao_caixa_id: session.id },
        transaction: t
      });

      // Calcula o resumo detalhado por forma de pagamento
      const totaisPorPagamento = sales.reduce((acc, sale) => {
          const method = sale.forma_pagamento || 'OUTROS';
          const value = parseFloat(sale.valor_total);
          acc[method] = (acc[method] || 0) + value;
          return acc;
      }, {});
      
      // Lógica de cálculo geral
      const totalMovimentos = movements.reduce((acc, mov) => acc + parseFloat(mov.valor), 0);
      const valor_final_calculado = parseFloat(session.valor_abertura) + totalMovimentos;
      const diferenca = parseFloat(valor_final_informado) - valor_final_calculado;

      // Atualiza a sessão (código existente)
      session.status = 'FECHADO';
      session.valor_fechamento = parseFloat(valor_final_informado);
      session.data_fechamento = new Date();
      session.usuario_fechamento_id = req.user.id;
      session.diferenca = diferenca;
      await session.save({ transaction: t });

      // Cria o movimento de fechamento (código existente)
      await CashierMovement.create({
        sessao_caixa_id: session.id,
        usuario_id: req.user.id,
        tipo_movimento: 'FECHAMENTO',
        valor: 0,
        descricao: `Fechamento com diferença de R$ ${diferenca.toFixed(2)}`,
      }, { transaction: t });

      await t.commit(); 
      
      // --- RESPOSTA FINAL E COMPLETA PARA O FRONTEND ---
      return res.json({
        message: 'Caixa fechado com sucesso!',
        closedSession: session, // Envia dados da sessão que foi fechada
        summary: { // Envia o resumo detalhado
          valorAbertura: parseFloat(session.valor_abertura),
          valorFinalCalculado: valor_final_calculado,
          valorFinalInformado: parseFloat(valor_final_informado),
          diferenca,
          totaisPorPagamento, // <--- Inclui o detalhamento por pagamento
        }
      });
    } catch (error) {
      await t.rollback();
      console.error("ERRO AO FECHAR O CAIXA:", error);
      return res.status(500).json({ error: 'Falha ao fechar o caixa.' });
    }
  }
}

module.exports = new CashierController();