class DatabaseService {
  constructor() {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('Electron API is not available. Make sure preload script is properly configured.');
    }
  }
  
  // Reminder: these functions are called in const typically at App.js or React components, and are defined in electron/main.js. Names in electron/main.js and here are tied through electron/preload.js context bridge
  async getTables() {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.getTables();
    } catch (error) {
      console.error('Error in getTables:', error);
      throw error;
    }
  }

  async getTableColumns(tableName) {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.getTableColumns(tableName);
    } catch (error) {
      console.error(`Error in getTableColumns(${tableName}):`, error);
      throw error;
    }
  }

  async getTableData(tableName) {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.getTableData(tableName);
    } catch (error) {
      console.error(`Error in getTableData(${tableName}):`, error);
      throw error;
    }
  }

  async addDataPoint(tableName, data) {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.addDataPoint(tableName, data);
    } catch (error) {
      console.error(`Error in addDataPoint(${tableName}):`, error);
      throw error;
    }
  }

  async selectExcelFile(filePath) {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.addDataTable(filePath);
    } catch (error) {
      console.error(`Error in addDataTable(${filePath}):`, error);
      throw error;
    }
  }

  async getNumericColumns(tableName) {
    const columns = await this.getTableColumns(tableName);

    // Filter out id fields and keep only numeric columns
    return columns.filter(col =>
      (col.type === 'INTEGER' || col.type === 'REAL') &&
      col.name.toLowerCase() !== 'id'
    );
  }

  async getTextColumns(tableName) {
    const columns = await this.getTableColumns(tableName);
    return columns.filter(col => col.type === 'TEXT');
  }
}

const databaseInstance = new DatabaseService();
export default databaseInstance;