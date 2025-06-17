import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import JsonInput from './components/JsonInput';
import TableDisplay from './components/TableDisplay';
import Header from './components/Header';
import Examples from './components/Examples';
import './App.css';

function App() {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTableData = (data) => {
    setTableData(data);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTableData(null);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const clearData = () => {
    setTableData(null);
    setError(null);
  };

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="content-grid">
            {/* Painel de Input */}
            <div className="input-panel">
              {/*<JsonInput 
                onTableData={handleTableData}
                onError={handleError}
                onLoading={handleLoading}
                loading={loading}
              />
              */}
              {!tableData && !error && (
                <Examples onExampleSelect={handleTableData} />
              )}
            </div>

            {/* Painel de Resultado */}
            <div className="result-panel">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Processando JSON...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h3>Erro na Conversão</h3>
                  <p>{error}</p>
                  <button 
                    className="btn btn-outline"
                    onClick={clearData}
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {tableData && !loading && (
                <TableDisplay 
                  data={tableData} 
                  onClear={clearData}
                />
              )}

              {!tableData && !error && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>Pronto para Converter</h3>
                  <p>
                    Cole seu JSON no painel ao lado ou selecione um dos exemplos abaixo 
                    para ver a tabela gerada automaticamente.
                  </p>
                  <div className="features-list">
                    <div className="feature">
                      <span className="feature-icon">✨</span>
                      <span>Suporte a objetos únicos e arrays</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🔍</span>
                      <span>Validação automática de JSON</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">📱</span>
                      <span>Interface responsiva</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;