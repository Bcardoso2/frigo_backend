// src/database/index.js
const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

// Importa todos os models
const User = require('../models/User');
const Product = require('../models/Product');
const StockLocation = require('../models/StockLocation');
const Stock = require('../models/Stock');
const CashierSession = require('../models/CashierSession');
const CashierMovement = require('../models/CashierMovement');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');

// Coloca todos os models em um array
const models = [User, Product, StockLocation, Stock, CashierSession, CashierMovement, Sale, SaleItem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Cria a conexão com o banco de dados
    this.connection = new Sequelize(dbConfig);

    // Itera por todos os models, inicializa eles e passa a conexão
    models
      .map(model => model.init(this.connection))
      // Depois de todos os models serem inicializados, cria as associações
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

module.exports = new Database();