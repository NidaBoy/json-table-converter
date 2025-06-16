const JsonProcessor = {
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

  convertToTable(jsonData) {
    try {
      let data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!Array.isArray(data)) data = [data];

      const columns = this.extractKeys(data);
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
};