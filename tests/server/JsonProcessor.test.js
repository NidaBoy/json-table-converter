const JsonProcessor = require('/server/utils/JsonProcessor');

describe('JsonProcessor.extractKeys', () => {
  test('extrai chaves únicas de um array de objetos simples', () => {
    const input = [{ a: 1, b: 2 }, { b: 3, c: 4 }];
    const keys = JsonProcessor.extractKeys(input).sort();
    expect(keys).toEqual(['a', 'b', 'c']);
  });

  test('extrai chaves de um objeto único', () => {
    const input = { x: 10, y: 20 };
    expect(JsonProcessor.extractKeys(input)).toEqual(['x', 'y']);
  });

  test('retorna array vazio para entrada não objeto/array', () => {
    expect(JsonProcessor.extractKeys('string')).toEqual([]);
    expect(JsonProcessor.extractKeys(null)).toEqual([]);
    expect(JsonProcessor.extractKeys(123)).toEqual([]);
  });
});

describe('JsonProcessor.convertToTable', () => {
  test('converte objeto único em tabela com uma linha', () => {
    const input = { nome: 'Alice', idade: 25 };
    const result = JsonProcessor.convertToTable(input);
    expect(result.columns).toEqual(['_index', 'nome', 'idade']);
    expect(result.rows[0]).toMatchObject({ _index: 1, nome: 'Alice', idade: '25' });
    expect(result.totalRows).toBe(1);
  });

  test('converte string JSON válida em tabela', () => {
    const input = JSON.stringify([{ a: 1 }, { a: 2, b: 3 }]);
    const result = JsonProcessor.convertToTable(input);
    expect(result.columns).toContain('_index');
    expect(result.columns).toContain('a');
    expect(result.columns).toContain('b');
    expect(result.totalRows).toBe(2);
  });

  test('preenche colunas ausentes com undefined formatado', () => {
    const input = [{ a: 1 }, { b: 2 }];
    const result = JsonProcessor.convertToTable(input);
    expect(result.rows[0].b).toBe('undefined');
    expect(result.rows[1].a).toBe('undefined');
  });

  test('lança erro para JSON inválido em string', () => {
    const badJson = '{"a": 1,}';
    expect(() => JsonProcessor.convertToTable(badJson)).toThrow('Erro ao processar JSON');
  });

  test('manuseia array de objetos com tipos variados', () => {
    const input = [{ ativo: true, valor: null }];
    const result = JsonProcessor.convertToTable(input);
    expect(result.rows[0].ativo).toBe('true');
    expect(result.rows[0].valor).toBe('null');
  });
});

describe('JsonProcessor.formatValue', () => {
  test('formata null e undefined corretamente', () => {
    expect(JsonProcessor.formatValue(null)).toBe('null');
    expect(JsonProcessor.formatValue(undefined)).toBe('undefined');
  });

  test('formata booleanos corretamente', () => {
    expect(JsonProcessor.formatValue(true)).toBe('true');
    expect(JsonProcessor.formatValue(false)).toBe('false');
  });

  test('formata objetos como JSON string', () => {
    const obj = { a: 1 };
    expect(JsonProcessor.formatValue(obj)).toBe(JSON.stringify(obj));
  });

  test('converte números e strings para string', () => {
    expect(JsonProcessor.formatValue(123)).toBe('123');
    expect(JsonProcessor.formatValue('hello')).toBe('hello');
  });
});

describe('JsonProcessor.validateJson', () => {
  test('valida JSON válido e retorna parsed', () => {
    const json = '{"nome":"Ana"}';
    const result = JsonProcessor.validateJson(json);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ nome: 'Ana' });
  });

  test('detecta JSON inválido', () => {
    const json = '{"nome":}';
    const result = JsonProcessor.validateJson(json);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
