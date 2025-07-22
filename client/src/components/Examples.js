import React from 'react';

const exampleData = [
  {
    name: 'Usuários Simples',
    json: [
      { id: 1, nome: "Ana", idade: 28 },
      { id: 2, nome: "Carlos", idade: 35 },
      { id: 3, nome: "Bruna", idade: 22 }
    ]
  },
  {
    name: 'Produtos',
    json: [
      { id: "P001", nome: "Notebook", preco: 4200.5 },
      { id: "P002", nome: "Celular", preco: 1999.99 }
    ]
  },
  {
    name: 'Objeto Único',
    json: { nome: "Empresa", local: "São Paulo", fundado: 2000 }
  }
];

const Examples = ({ onExampleSelect }) => {
  return (
    <div className="examples">
      <h3>Exemplos:</h3>
      <ul className="example-list">
        {exampleData.map((ex, i) => (
          <li key={i}>
            <button className="btn btn-sm" onClick={() => onExampleSelect(ex.json)}>
              {ex.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Examples;