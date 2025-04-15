import React, { useState, useEffect } from 'react';

function DataEntryForm({ tableName, columns, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Reset form when table changes
    const initialData = {};
    if (columns) {
      columns.forEach(col => {
          initialData[col.name] = '';
        });
    }
    setFormData(initialData);
  }, [columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!columns) return null;

  return (
    <div className="data-entry-form">
      <h3>Add Data to {tableName}</h3>
      <form onSubmit={handleSubmit}>
        {columns.map(col => (
          <div key={col.name} className="form-group">
            <label>{col.name}:</label>
            <input
              type={col.type === 'INTEGER' || col.type === 'REAL' ? 'number' : 'text'}
              name={col.name}
              value={formData[col.name] || ''}
              onChange={handleChange}
              required={!col.nullable}
            />
          </div>
        ))}
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default DataEntryForm;