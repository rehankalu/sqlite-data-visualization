const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script started');

// Test IPC
ipcRenderer.invoke('get-tables')
  .then(tables => {
    console.log('Tables from preload test:', tables);
  }).catch(err => {
    console.error('Error in preload test:', err);
  });

// <Function in Database.js>: () => return ipcRenderer.invoke(<Function in main.js>, <inputs>)
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    getTables: () => {
      return ipcRenderer.invoke('get-tables');
    },
    getTableColumns: (tableName) => {
      return ipcRenderer.invoke('get-table-columns', tableName);
    },
    getTableData: (tableName) => {
      return ipcRenderer.invoke('get-table-data', tableName);
    },
    addDataPoint: (tableName, data) => {
      return ipcRenderer.invoke('add-data-point', tableName, data);
    },
    addDataTable: (filePath) => {
      return ipcRenderer.invoke('add-data-table', filePath);
    },
    selectExcelFile: () => ipcRenderer.invoke('select-excel')
  }
);

console.log('Preload script complete - API exposed');