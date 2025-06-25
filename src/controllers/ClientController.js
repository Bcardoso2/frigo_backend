// src/controllers/ClientController.js
const Client = require('../models/Client');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op } = require('sequelize');

class ClientController {
  // Cadastrar novo cliente (seu código já estava correto)
  async store(req, res) {
    try {
      const { nome, cpf_cnpj, email } = req.body;
      if (!nome) {
        return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
      }
      if (cpf_cnpj) {
        const existingCpfCnpj = await Client.findOne({ where: { cpf_cnpj } });
        if (existingCpfCnpj) return res.status(400).json({ error: 'Este CPF/CNPJ já está cadastrado.' });
      }
      if (email) {
        const existingEmail = await Client.findOne({ where: { email } });
        if (existingEmail) return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      }
      const client = await Client.create(req.body);
      return res.status(201).json(client);
    } catch (error) {
      console.error("ERRO AO CRIAR CLIENTE:", error);
      return res.status(500).json({ error: 'Falha ao cadastrar cliente.' });
    }
  }

  // Listar todos os clientes (seu código já estava correto)
  async index(req, res) {
    try {
      const clients = await Client.findAll({ order: [['nome', 'ASC']] });
      return res.json(clients);
    } catch (error) {
      console.error("ERRO AO LISTAR CLIENTES:", error);
      return res.status(500).json({ error: 'Falha ao listar clientes.' });
    }
  }

  // Atualizar um cliente (seu código já estava correto)
  async update(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      await client.update(req.body);
      return res.json(client);
    } catch (error) {
      console.error("ERRO AO ATUALIZAR CLIENTE:", error);
      return res.status(500).json({ error: 'Falha ao atualizar cliente.' });
    }
  }

  // --- MÉTODO NOVO PARA BUSCAR O HISTÓRICO DE COMPRAS ---
  async showSales(req, res) {
    try {
      const { id } = req.params;

      // Busca todas as vendas para o ID do cliente informado
      const sales = await Sale.findAll({
        where: { cliente_id: id },
        // Incluímos todos os detalhes para um relatório rico
        include: [
          {
            model: SaleItem,
            as: 'itens',
            // Incluímos os detalhes do produto dentro de cada item da venda
            include: [
              { model: Product, as: 'produto', attributes: ['nome'] }
            ]
          },
          { model: User, as: 'operador', attributes: ['nome'] }
        ],
        order: [['createdAt', 'DESC']] // Vendas mais recentes primeiro
      });

      return res.json(sales);
    } catch (error) {
      console.error(`ERRO AO BUSCAR HISTÓRICO DO CLIENTE #${req.params.id}:`, error);
      return res.status(500).json({ error: 'Falha ao buscar histórico do cliente.' });
    }
  }
}

module.exports = new ClientController();