// src/controllers/ClientController.js
const Client = require('../models/Client');
const { Op } = require('sequelize');

class ClientController {
  // Cadastrar novo cliente
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

  // Listar todos os clientes
  async index(req, res) {
    try {
      const clients = await Client.findAll({ order: [['nome', 'ASC']] });
      return res.json(clients);
    } catch (error) {
      console.error("ERRO AO LISTAR CLIENTES:", error);
      return res.status(500).json({ error: 'Falha ao listar clientes.' });
    }
  }

  // Atualizar um cliente
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
}

module.exports = new ClientController();