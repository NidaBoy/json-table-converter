import React, { useState, useMemo } from 'react';
import { Download, Search, RotateCcw, Table, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TableDisplay = ({ data, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtrar dados baseado no termo de busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return data.rows;
    
    return data.rows.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data.rows, searchTerm]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginação
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    try {
      const headers = data.columns.join(',');
      const rows = data.rows.map(row =>
        data.columns.map(col => {
          const value = row[col];
          // Escapar aspas e adicionar aspas se necessário
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      ).join('\n');

      const csvContent = `${headers}\n${rows}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `tabela_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Tabela exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar tabela');
    }
  };

  const exportToJSON = () => {
    try {
      const jsonContent = JSON.stringify(data.rows, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dados_${new Date().getTime()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados como JSON!');
    } catch (error) {
      toast.error('Erro ao exportar JSON');
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="table-display-container">
      <div className="table-header">
        <div className="table-title">
          <h2>
            <Table size={20} />
            Tabela Gerada
          </h2>
          <div className="table-stats">
            <span className="stat">
              {filteredData.length} {filteredData.length === 1 ? 'linha' : 'linhas'}
            </span>
            <span className="stat">
              {data.totalColumns} {data.totalColumns === 1 ? 'coluna' : 'colunas'}
            </span>
          </div>
        </div>

        <div className="table-actions">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar na tabela..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset para primeira página ao buscar
              }}
              className="search-input"
            />
          </div>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="items-per-page-select"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>

          <button className="btn btn-outline" onClick={exportToCSV}>
            <Download size={16} />
            CSV
          </button>
          
          <button className="btn btn-outline" onClick={exportToJSON}>
            <Download size={16} />
            JSON
          </button>

          <button className="btn btn-ghost" onClick={onClear}>
            <RotateCcw size={16} />
            Novo
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="no-results">
          <Search size={48} className="no-results-icon" />
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente ajustar o termo de busca ou limpar os filtros.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {data.columns.map((column) => (
                    <th
                      key={column}
                      onClick={() => handleSort(column)}
                      className={`sortable ${sortConfig.key === column ? 'sorted' : ''}`}
                    >
                      <div className="th-content">
                        <span className={column === '_index' ? 'index-column' : ''}>
                          {column === '_index' ? '#' : column}
                        </span>
                        <span className="sort-indicator">
                          {getSortIcon(column)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {data.columns.map((column) => (
                      <td
                        key={column}
                        className={`${column === '_index' ? 'index-cell' : ''}`}
                      >
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default TableDisplay;