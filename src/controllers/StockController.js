// src/controllers/StockController.js
const { Op } = require('sequelize');
const Stock = require('../models/Stock');
const Product = require('../models/Product');
const StockLocation = require('../models/StockLocation');
const sequelize = require('../database/index').connection; // Importa a conexão para transações

class StockController {
  // Listar todo o estoque
  async index(req, res) {
    try {
      const stock = await Stock.findAll({
        include: [
          { model: Product, as: 'produto' },
          { model: StockLocation, as: 'local' },
        ],
        order: [['id', 'ASC']]
      });
      return res.json(stock);
    } catch (error) {
      return res.status(500).json({ error: 'Falha ao buscar estoque.' });
    }
  }

  // Transferir produtos entre locais (ex: Depósito -> Prateleira)
  async transfer(req, res) {
    const t = await sequelize.transaction(); // Inicia uma transação

    try {
      const { produto_id, local_origem_id, local_destino_id, quantidade } = req.body;

      // 1. Verifica o estoque de origem
      const estoqueOrigem = await Stock.findOne({
        where: { produto_id, local_id: local_origem_id },
        transaction: t,
      });

      if (!estoqueOrigem || estoqueOrigem.quantidade < quantidade) {
        await t.rollback(); // Desfaz a transação
        return res.status(400).json({ error: 'Estoque insuficiente no local de origem.' });
      }

      // 2. Decrementa o estoque da origem
      estoqueOrigem.quantidade -= quantidade;
      await estoqueOrigem.save({ transaction: t });

      // 3. Incrementa o estoque do destino (cria se não existir)
      let estoqueDestino = await Stock.findOne({
        where: { produto_id, local_id: local_destino_id },
        transaction: t,
      });

      if (estoqueDestino) {
        estoqueDestino.quantidade = parseFloat(estoqueDestino.quantidade) + parseFloat(quantidade);
        await estoqueDestino.save({ transaction: t });
      } else {
        estoqueDestino = await Stock.create({
          produto_id,
          local_id: local_destino_id,
          quantidade,
        }, { transaction: t });
      }
      
      await t.commit(); // Efetiva a transação

      return res.json({ message: 'Transferência realizada com sucesso.' });
    } catch (error) {
      await t.rollback(); // Desfaz a transação em caso de erro
      console.error(error);
      return res.status(500).json({ error: 'Falha ao transferir estoque.' });
    }
  }
}

module.exports = new StockController();