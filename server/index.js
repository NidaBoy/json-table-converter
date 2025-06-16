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

    // Converte JSON para formato de tabela
  convertToTable(jsonData) {
    try {
      let data;
      
      // Parse string JSON se necessário
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }

      // Se não é array, converte para array
      if (!Array.isArray(data)) {
        data = [data];
      }

      // Extrai as colunas (chaves)
      const columns = this.extractKeys(data);
      
      // Converte os dados para formato de tabela
      const rows = data.map((item, index) => {
        const row = { _index: index + 1 };
        columns.forEach(col => {
          row[col] = this.formatValue(item[col]);
        });
        return row;
      });

      return {
        columns: ['_index', ...columns],
        rows,
        totalRows: rows.length,
        totalColumns: columns.length
      };
    } catch (error) {
      throw new Error(`Erro ao processar JSON: ${error.message}`);
    }
  },

    // Formata valores para exibição na tabela
  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  },

  // Valida se o JSON é válido
  validateJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
};