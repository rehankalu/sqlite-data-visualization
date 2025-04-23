class Database {
  constructor() {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('Electron API is not available. Make sure preload script is properly configured.');
    }
  }

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

  async addDataTable(data) {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API is not available');
      }
      return await window.electronAPI.addDataTable(data);
    } catch (error) {
      console.error(`Error in addDataTable(${data.tableName}):`, error);
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

const databaseInstance = new Database();
export default databaseInstance;