import React from 'react';

function TableSelector({ tables, selectedTable, onTableChange }) {
  return (
    <div className="table-selector">
      <label>Data Table:</label>
      <select value={selectedTable} onChange={e => onTableChange(e.target.value)}>
        <option value="">Select a table</option>
        {tables.map(table => (
          <option key={table} value={table}>{table}</option>
        ))}
      </select>
    </div>
  );
}

export default TableSelector;