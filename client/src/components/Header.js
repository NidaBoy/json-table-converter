import React from 'react';
import { Table } from 'lucide-react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <Table size={28} />
        <h1>Conversor de JSON para Tabela</h1>
      </div>
    </header>
  );
};

export default Header;