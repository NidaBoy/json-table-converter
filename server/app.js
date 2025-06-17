const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Rotas da API
app.use('/api', apiRoutes);

// Rota de fallback para SPA React
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;