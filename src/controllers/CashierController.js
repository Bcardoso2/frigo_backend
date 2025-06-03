// src/controllers/CashierController.js
const CashierSession = require('../models/CashierSession');
const CashierMovement = require('../models/CashierMovement');
// É importante importar o User para incluir os dados do operador
const User = require('../models/User'); 
const { Op } = require('sequelize');

class CashierController {

  // --- MÉTODO NOVO ADICIONADO ---
  // Este método busca e retorna a sessão de caixa que está atualmente aberta.
  async status(req, res) {
    try {
      const activeSession = await CashierSession.findOne({
        where: { status: 'ABERTO' },
        // Inclui o nome do operador que abriu o caixa na resposta
        include: [{ model: User, as: 'operador_abertura', attributes: ['nome'] }],
      });

      // Retorna a sessão ativa, ou null se não houver nenhuma
      return res.json(activeSession);
    } catch (error) {
      return res.status(500).json({ error: 'Falha ao buscar status do caixa.' });
    }
  }

  // Abrir o caixa (seu código já estava correto)
  async open(req, res) {
    try {
      const { valor_abertura } = req.body;
      const usuario_id = req.user.id; // Pego do middleware

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

      return res.status(201).json(session);
    } catch (error) {
      console.error(error); // Adicionado para ver o erro detalhado no terminal
      return res.status(500).json({ error: 'Falha ao abrir o caixa.' });
    }
  }

  // Realizar Sangria (seu código já estava correto)
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
        valor: -valor, // Sangria é um valor negativo
        descricao,
      });
      
      return res.json(movement);
    } catch (error) {
      console.error(error); // Adicionado para ver o erro detalhado no terminal
      return res.status(500).json({ error: 'Falha ao realizar sangria.' });
    }
  }
}

module.exports = new CashierController();