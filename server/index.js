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

// Rotas da API
app.post('/api/convert', (req, res) => {
  try {
    const { jsonData } = req.body;

    if (!jsonData) {
      return res.status(400).json({
        success: false,
        error: 'JSON data é obrigatório'
      });
    }

    // Valida e converte o JSON
    let parsedData;
    if (typeof jsonData === 'string') {
      const validation = JsonProcessor.validateJson(jsonData);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: `JSON inválido: ${validation.error}`
        });
      }
      parsedData = validation.data;
    } else {
      parsedData = jsonData;
    }

    // Converte para formato de tabela
    const tableData = JsonProcessor.convertToTable(parsedData);

    res.json({
      success: true,
      data: tableData
    });
  } catch (error) {
    console.error('Erro na conversão:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para validar JSON
app.post('/api/validate', (req, res) => {
  try {
    const { jsonString } = req.body;

    if (!jsonString) {
      return res.status(400).json({
        success: false,
        error: 'JSON string é obrigatória'
      });
    }

    const validation = JsonProcessor.validateJson(jsonString);
    
    res.json({
      success: true,
      valid: validation.valid,
      error: validation.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: enviar de volta o app React
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});

module.exports = app;