import React, { useState, useEffect } from 'react';
import ScatterPlot from './components/ScatterPlot';
import AxisSelector from './components/AxisSelector';
import LegendSelector from './components/LegendSelector';
import TableSelector from './components/TableSelector';
import DataEntryForm from './components/DataEntryForm';
import Database from './services/Database';
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
  const [showDataForm, setShowDataForm] = useState(false);

  // Load tables on component mount
  useEffect(() => {
    async function loadTables() {
      try {
        // Diagnostic log
        // console.log('Attempting to load tables...');
        if (!Database) {
          console.error('Database service is not available');
          setTables([]);
          return;
        }

        const availableTables = await Database.getTables();
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
      let filtered_columns =[];

      if (!selectedTable) return;

      try {
        const data = await Database.getTableData(selectedTable);
        const columns = await Database.getTableColumns(selectedTable);
        const numCols = await Database.getNumericColumns(selectedTable);
        const txtCols = await Database.getTextColumns(selectedTable);

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

  // Handle adding new data point
  const handleAddDataPoint = async (formData) => {
    try {
      console.log(formData)
      await Database.addDataPoint(selectedTable, formData);
      console.log("Do I get past addDataPoint?")
      // Refresh data
      const newData = await Database.getTableData(selectedTable);
      setTableData(newData);
      setShowDataForm(false);
    } catch (error) {
      console.error('Error adding data point:', error);
      alert('Failed to add data point. Check console for details.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Fuel Cell Technologies Data Visualization</h1>
      </header>

      <div className="controls">
        <TableSelector
          tables={tables}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
        />

        {selectedTable && (
          <>
            <div className="axis-controls">
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
            </div>

            <button
              className="add-data-btn"
              onClick={() => setShowDataForm(true)}
            >
              + Add Data
            </button>
          </>
        )}
      </div>

      {selectedTable && xAxis && yAxis && (
        <div className="visualization">
          <ScatterPlot
            data={tableData}
            xAxis={xAxis}
            yAxis={yAxis}
            category={category}
          />
        </div>
      )}

      {showDataForm && (
        <div className="modal">
          <div className="modal-content">
            <DataEntryForm
              tableName={selectedTable}
              columns={tableColumns}
              onSubmit={handleAddDataPoint}
              onCancel={() => setShowDataForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;