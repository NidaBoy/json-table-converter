const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Utilities para processamento de JSON
const JsonProcessor = {
  // Extrai as chaves únicas de um ou múltiplos objetos JSON
  extractKeys(jsonData) {
    if (Array.isArray(jsonData)) {
      const allKeys = new Set();
      jsonData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key));
        }
      });
      return Array.from(allKeys);
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      return Object.keys(jsonData);
    }
    return [];
  },
}