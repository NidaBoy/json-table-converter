
import React, { useState, useCallback } from 'react';
import { FileText, Upload, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertJsonToTable, validateJson } from '../services/api';

const JsonInput = ({ onTableData, onError, onLoading, loading }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isValid, setIsValid] = useState(null);

  // Valida JSON em tempo real
  const validateJsonInput = useCallback(async (input) => {
    if (!input.trim()) {
      setIsValid(null);
      return;
    }

    try {
      const result = await validateJson(input);
      setIsValid(result.valid);
      if (!result.valid && result.error) {
        console.log('JSON inválido:', result.error);
      }
    } catch (error) {
      setIsValid(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setJsonInput(value);
    
    // Debounce da validação
    const timeoutId = setTimeout(() => {
      validateJsonInput(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleConvert = async () => {
    if (!jsonInput.trim()) {
      toast.error('Por favor, insira um JSON válido');
      return;
    }

    onLoading(true);
    
    try {
      const result = await convertJsonToTable(jsonInput);
      onTableData(result.data);
      toast.success('JSON convertido com sucesso!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao converter JSON';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setIsValid(null);
    onTableData(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Por favor, selecione um arquivo JSON válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setJsonInput(content);
      validateJsonInput(content);
      toast.success('Arquivo carregado com sucesso!');
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
    };
    reader.readAsText(file);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setIsValid(true);
      toast.success('JSON formatado!');
    } catch (error) {
      toast.error('JSON inválido para formatação');
    }
  };

  const getValidationIcon = () => {
    if (isValid === null) return null;
    return isValid ? (
      <Check className="validation-icon valid" size={16} />
    ) : (
      <span className="validation-icon invalid">✕</span>
    );
  };

  return (
    <div className="json-input-container">
      <div className="input-header">
        <h2>
          <FileText size={20} />
          Inserir JSON
        </h2>
        <div className="input-actions">
          <label className="file-upload-btn">
            <Upload size={16} />
            Carregar Arquivo
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          {jsonInput && (
            <button
              className="btn btn-ghost"
              onClick={formatJson}
              title="Formatar JSON"
            >
              Formatar
            </button>
          )}
        </div>
      </div>

      <div className="textarea-container">
        <textarea
          className={`json-textarea ${isValid === false ? 'invalid' : ''} ${isValid === true ? 'valid' : ''}`}
          value={jsonInput}
          onChange={handleInputChange}
          placeholder={`Cole seu JSON aqui...

Exemplos suportados:
• Objeto único: {"nome": "João", "idade": 30}
• Array de objetos: [{"nome": "João"}, {"nome": "Maria"}]
• Estruturas complexas com objetos aninhados`}
          rows={12}
        />
        
        {getValidationIcon() && (
          <div className="validation-indicator">
            {getValidationIcon()}
          </div>
        )}
      </div>

      <div className="input-footer">
        <div className="input-info">
          {jsonInput && (
            <span className="char-count">
              {jsonInput.length} caracteres
            </span>
          )}
          {isValid === false && (
            <span className="validation-error">
              JSON inválido
            </span>
          )}
          {isValid === true && (
            <span className="validation-success">
              JSON válido
            </span>
          )}
        </div>
        
        <div className="input-buttons">
          {jsonInput && (
            <button
              className="btn btn-outline"
              onClick={handleClear}
              disabled={loading}
            >
              <Trash2 size={16} />
              Limpar
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={!jsonInput.trim() || loading || isValid === false}
          >
            {loading ? 'Convertendo...' : 'Converter para Tabela'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonInput;