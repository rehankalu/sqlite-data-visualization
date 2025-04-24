import React, { useState } from 'react';

function DataTableEntryForm({ onSubmit, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    console.log(event.target.value)
    console.log(event.target.files[0])
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onSubmit(selectedFile.path);
    }
    setSelectedFile(null);
  };

  return (
    <div className="data-table-entry-form">
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}

        <div className="form-buttons">
          <button type="submit" disabled={!selectedFile}>Upload</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default DataTableEntryForm;