import React, { useState, useEffect } from 'react';
import ScatterPlot from './components/ScatterPlot';
import DataTable from './components/DataTable';
import AxisSelector from './components/AxisSelector';
import LegendSelector from './components/LegendSelector';
import TableSelector from './components/TableSelector';
import DataPointEntryForm from './components/DataPointEntryForm';
import DataTableEntryForm from './components/DataTableEntryForm';
import DatabaseService from './services/DatabaseService';
import './App.css';

function App() {
  // State variables
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [textColumns, setTextColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [category, setCategory] = useState('');
  const [showDataPointForm, setShowDataPointForm] = useState(false);
  const [showDataTableInputForm, setShowDataTableForm] = useState(false);

  // Load tables on component mount
  useEffect(() => {
    async function loadTables() {
      try {
        // Diagnostic log
        // console.log('Attempting to load tables...');
        if (!DatabaseService) {
          console.error('Database service is not available');
          setTables([]);
          return;
        }

        const availableTables = await DatabaseService.getTables();
        // Diagnostic log
        // console.log('Tables loaded:', availableTables);
        setTables(availableTables || []);
      } catch (error) {
        console.error('Error loading tables:', error);
        setTables([]);
        // Optional: Add state for error message to display to user
      }
    }

    loadTables();
  }, []);

  // Load table data and columns when selected table changes
  useEffect(() => {
    async function loadTableData() {
      let filtered_columns = [];

      if (!selectedTable) return;

      try {
        const data = await DatabaseService.getTableData(selectedTable);
        const columns = await DatabaseService.getTableColumns(selectedTable);
        const numCols = await DatabaseService.getNumericColumns(selectedTable);
        const txtCols = await DatabaseService.getTextColumns(selectedTable);

        // Filter out 'id' fields
        filtered_columns = columns.filter(col => col.name.toLowerCase() !== 'id')

        setTableData(data);
        setTableColumns(filtered_columns);
        setNumericColumns(numCols.map(col => col.name));
        setTextColumns(txtCols.map(col => col.name));

        // Reset axis and legend selections
        setXAxis(numCols.length > 0 ? numCols[0].name : '');
        setYAxis(numCols.length > 1 ? numCols[1].name : '');
        setCategory('');
      } catch (error) {
        console.error('Error loading table data:', error);
      }
    }

    loadTableData();
  }, [selectedTable]);

  // Handles closure of form modals by Escape key 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDataPointForm && e.key === 'Escape') {
        setShowDataPointForm(false);
      }
      if (showDataTableInputForm && e.key === 'Escape') {
        setShowDataTableForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDataPointForm, showDataTableInputForm]);

  // Handle adding new data point
  const handleAddDataPoint = async (formData) => {
    try {
      const response = await DatabaseService.addDataPoint(selectedTable, formData);
      console.log(response.id)

      // Refresh data
      const newData = await DatabaseService.getTableData(selectedTable);
      setTableData(newData);
      setShowDataPointForm(false);

    } catch (error) {
      console.error('Error adding data point:', error);
      alert('Failed to add data point. Check console for details.');
    }
  };

  // Handle adding new data table
  const handleAddDataTable = async (filePath) => {
    try {
      console.log(filePath)
      setSelectedTable(await DatabaseService.addDataTable(filePath));

      // Refresh data
      const newData = await DatabaseService.getTableData(selectedTable);
      setTableData(newData);
      setShowDataTableForm(false);

    } catch (error) {
      console.error('Error adding data table:', error);
      alert('Failed to add data point. Check console for details.');
    }
  };

  // // Handle adding new data table
  // const handleAddDataTable = async (formData) => {

  //   const fs = require('fs');
  //   const file = formData.get('file');
  //   const arrayBuffer = await file.arrayBuffer();

  //   const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  //   if (workbook.SheetNames.length !== 1) {
  //     alert('The Excel file must contain exactly one sheet.');
  //     return;
  //   }

  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];
  //   const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  //   if (data.length < 2) {
  //     alert('The sheet must contain at least one header row and one data row.');
  //     return;
  //   }

  //   const headers = data[0];
  //   const rows = data.slice(1);

  //   const SQL = await initSqlJs();
  //   const db = new SQL.Database();

  //   const tableName = 'uploaded_data';
  //   const columnDefs = headers.map(h => `"${h}" TEXT`).join(', ');
  //   db.run(`CREATE TABLE ${tableName} (${columnDefs});`);

  //   const stmt = db.prepare(
  //     `INSERT INTO ${tableName} (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${headers.map(() => '?').join(', ')})`
  //   );

  //   rows.forEach(row => {
  //     const paddedRow = headers.map((_, i) => row[i] || null);
  //     stmt.run(paddedRow);
  //   });
  //   stmt.free();

  //   // To verify:
  //   const result = db.exec(`SELECT * FROM ${tableName}`);
  //   console.log(result[0].values);

  //   alert('Upload complete!');
  // };

  return (
    <div className="app">
      <header>
        <h1>Fuel Cell Technologies Data Visualization</h1>
      </header>
      <div className="grid-container">
        <div className="controlPanel">
          <div className="controls">
            <TableSelector
              tables={tables}
              selectedTable={selectedTable}
              onTableChange={setSelectedTable}
            />

            {selectedTable && (
              <>
                <AxisSelector
                  label="X-Axis"
                  options={numericColumns}
                  value={xAxis}
                  onChange={setXAxis}
                />

                <AxisSelector
                  label="Y-Axis"
                  options={numericColumns}
                  value={yAxis}
                  onChange={setYAxis}
                />

                <LegendSelector
                  options={textColumns}
                  value={category}
                  onChange={setCategory}
                />

                <button
                  className="button add-data-point-btn"
                  onClick={() => setShowDataPointForm(true)}
                >
                  Add Data Point <br />
                  to {selectedTable}
                </button>
              </>
            )}
          </div>
          <div className="buttons">
            <button
              className="button add-data-table-btn"
              onClick={() => setShowDataTableForm(true)}
            >
              Add Data Table
            </button>
          </div>
        </div>
      </div>
      {selectedTable && xAxis && yAxis && (
        <div className="content">
          <div className="visualization">
            <ScatterPlot
              data={tableData}
              xAxis={xAxis}
              yAxis={yAxis}
              category={category}
            />
          </div>

          <div className="tabulation">

            <DataTable
              data={tableData}
              xAxis={xAxis}
              yAxis={yAxis}
              category={category}
            />
          </div>
        </div>
      )}

      {showDataPointForm && (
        <div className="modal">
          <div className="modal-content">
            <DataPointEntryForm
              tableName={selectedTable}
              columns={tableColumns}
              onSubmit={handleAddDataPoint}
              onCancel={() => setShowDataPointForm(false)}
            />
          </div>
        </div>
      )}

      {showDataTableInputForm && (
        <div className="modal">
          <div className="modal-content">
            <DataTableEntryForm
              onSubmit={handleAddDataTable}
              onCancel={() => setShowDataTableForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;