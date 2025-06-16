const express = require('express');
const router = express.Router();
const JsonProcessor = require('../utils/JsonProcessor');

router.post('/convert', (req, res) => {
  try {
    const { jsonData } = req.body;

    if (!jsonData) {
      return res.status(400).json({
        success: false,
        error: 'JSON data é obrigatório'
      });
    }

    const parsedData = typeof jsonData === 'string'
      ? (() => {
          const validation = JsonProcessor.validateJson(jsonData);
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: `JSON inválido: ${validation.error}`
            });
          }
          return validation.data;
        })()
      : jsonData;

    const tableData = JsonProcessor.convertToTable(parsedData);

    res.json({ success: true, data: tableData });

  } catch (error) {
    console.error('Erro na conversão:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});