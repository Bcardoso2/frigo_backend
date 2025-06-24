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
      // 1. RECEBE OS NOVOS CAMPOS DO FRONTEND
      const { 
        forma_pagamento, 
        itens, // itens = [{ produto_id, quantidade, preco_unitario }, ...]
        cliente_id, 
        funcionario_crediario_nome, 
        taxa_crediario 
      } = req.body;
      
      const usuario_id = req.user.id;

      // 2. Verifica se o caixa está aberto
      const session = await CashierSession.findOne({ where: { status: 'ABERTO' } });
      if (!session) {
        await t.rollback();
        return res.status(400).json({ error: 'Caixa está fechado. Abra o caixa para iniciar vendas.' });
      }
      
      // 3. Valida o estoque de todos os itens ANTES de começar
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
      
      // 4. CALCULA O VALOR TOTAL BASEADO NOS PREÇOS ENVIADOS (que já podem conter juros)
      const valor_total = itens.reduce((total, item) => {
          return total + (item.quantidade * item.preco_unitario);
      }, 0);

      // 5. CRIA A VENDA com os campos novos
      const sale = await Sale.create({
        usuario_id,
        sessao_caixa_id: session.id,
        valor_total,
        forma_pagamento,
        cliente_id: cliente_id || null, // Salva o ID do cliente ou null
        funcionario_crediario_nome: funcionario_crediario_nome || null,
        taxa_crediario: taxa_crediario || null,
      }, { transaction: t });

      // 6. CRIA OS ITENS DA VENDA e atualiza o estoque
      for (const item of itens) {
        await SaleItem.create({
          venda_id: sale.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario, // Usa o preço já ajustado que veio do frontend
          valor_subtotal: item.quantidade * item.preco_unitario,
        }, { transaction: t });

        // Decrementa estoque da prateleira
        const estoquePrateleira = await Stock.findOne({
          where: { produto_id: item.produto_id, local_id: prateleira.id },
          transaction: t
        });
        estoquePrateleira.quantidade -= item.quantidade;
        await estoquePrateleira.save({ transaction: t });
      }

      // 7. Cria o Movimento de Caixa
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
      console.error("ERRO AO FINALIZAR VENDA:", error);
      return res.status(400).json({ error: error.message || 'Falha ao processar venda.' });
    }
  }
}

module.exports = new SaleController();