// src/controllers/ProductController.js
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const StockLocation = require('../models/StockLocation'); // Para encontrar o 'DEPOSITO'
const { Op } = require('sequelize'); // Para operadores como 'ne' (not equal) no update

class ProductController {
  // Cadastrar um novo produto
  async store(req, res) {
    const t = await Product.sequelize.transaction(); // Inicia uma transação
    try {
      const {
        nome,
        preco_venda,
        unidade_medida,
        estoque_inicial,
        preco_custo,
        codigo_referencia,
        grupo,
        fabricante,
        departamento,
      } = req.body;

      // Validação básica
      if (!nome || !preco_venda || !unidade_medida) {
        await t.rollback();
        return res.status(400).json({ error: 'Nome, preço de venda e unidade de medida são obrigatórios.' });
      }

      const product = await Product.create({
        nome,
        preco_venda,
        unidade_medida,
        preco_custo: preco_custo || 0.00, // Garante um valor padrão se não enviado
        codigo_referencia,
        grupo,
        fabricante,
        departamento,
      }, { transaction: t });

      // Se um estoque inicial for informado, adiciona no depósito
      if (estoque_inicial && parseFloat(estoque_inicial) > 0) {
        // Busca o ID do local 'DEPOSITO'. Idealmente, isso seria configurável ou pego de um enum.
        const deposito = await StockLocation.findOne({ where: { nome: 'DEPOSITO' }, transaction: t });
        if (!deposito) {
            await t.rollback();
            // Se DEPOSITO não existir, pode ser um problema de setup inicial.
            // Para este exemplo, vamos assumir que ele SEMPRE existe e seu ID é 1, mas buscar é mais seguro.
            // Se não encontrou, pode-se criar ou lançar um erro mais específico.
            // Para simplificar, vamos forçar ID 1 se não encontrar, mas isso NÃO É ideal para produção.
            // throw new Error("Local 'DEPOSITO' não encontrado. Verifique a configuração inicial.");
            console.warn("Local 'DEPOSITO' não encontrado, usando ID 1 como fallback. Verifique a configuração.");
             await Stock.create({
              produto_id: product.id,
              local_id: 1, // Assumindo que 'DEPOSITO' tem ID 1
              quantidade: parseFloat(estoque_inicial),
            }, { transaction: t });
        } else {
             await Stock.create({
              produto_id: product.id,
              local_id: deposito.id,
              quantidade: parseFloat(estoque_inicial),
            }, { transaction: t });
        }
      }

      await t.commit(); // Efetiva a transação
      return res.status(201).json(product);
    } catch (error) {
      await t.rollback(); // Desfaz a transação em caso de erro
      console.error(error);
      return res.status(500).json({ error: 'Falha ao criar produto.', details: error.message });
    }
  }

  // Listar todos os produtos
  async index(req, res) {
    try {
      const products = await Product.findAll({
        order: [['nome', 'ASC']],
        // Você pode adicionar 'include' aqui se quiser trazer dados de tabelas relacionadas
        // Ex: include: [{ model: Stock, as: 'estoque' }]
      });
      return res.json(products);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao listar produtos.' });
    }
  }

  // Buscar um produto por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        // Exemplo de como incluir o estoque ao buscar um produto específico
        // include: [{ model: Stock, as: 'estoque', include: [{ model: StockLocation, as: 'local'}] }]
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      return res.json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao buscar produto.' });
    }
  }

  // Atualizar um produto existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        preco_venda,
        unidade_medida, // Adicionado para permitir alteração da unidade
        preco_custo,
        codigo_referencia,
        grupo,
        fabricante,
        departamento,
      } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // Atualiza os campos. Se um campo não for enviado no body, mantém o valor existente.
      product.nome = nome !== undefined ? nome : product.nome;
      product.preco_venda = preco_venda !== undefined ? preco_venda : product.preco_venda;
      product.unidade_medida = unidade_medida !== undefined ? unidade_medida : product.unidade_medida;
      product.preco_custo = preco_custo !== undefined ? preco_custo : product.preco_custo;
      product.codigo_referencia = codigo_referencia !== undefined ? codigo_referencia : product.codigo_referencia;
      product.grupo = grupo !== undefined ? grupo : product.grupo;
      product.fabricante = fabricante !== undefined ? fabricante : product.fabricante;
      product.departamento = departamento !== undefined ? departamento : product.departamento;

      await product.save();
      return res.json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao atualizar produto.' });
    }
  }

  // Deletar um produto (CUIDADO: esta é uma exclusão física)
  // Em sistemas reais, geralmente se faz uma "exclusão lógica" (marcando como inativo)
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // Antes de deletar o produto, você pode querer verificar se ele está em alguma venda
      // ou deletar o estoque associado. Por simplicidade, aqui apenas deletamos o produto.
      // Se houver foreign keys no estoque apontando para produtos, pode dar erro
      // se não forem configuradas para ON DELETE CASCADE ou SET NULL.

      // Exemplo: Deletar estoque associado antes de deletar o produto
      // await Stock.destroy({ where: { produto_id: id }});

      await product.destroy();
      return res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao deletar produto.' });
    }
  }
}

module.exports = new ProductController();