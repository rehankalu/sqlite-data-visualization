console.log("Electron main process starting...")
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Database = require('better-sqlite3');

let db;
let mainWindow;

function ensureDb() {
  if (!db) {
    try {
      initDatabase();
      if (!db) {
        throw new Error('Database initialization failed');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
}

function createWindow() {
  console.log("Attempting to open window");
  try {

    console.log('Preload script path:', preloadPath);
    const preloadPath = path.join(__dirname, 'preload2.js');

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath
      },
    });

    mainWindow.loadURL(
      isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
      console.log('Running in development');
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (err) {
    console.error('Error in createWindow:', err);
  }
}

app.on('ready', () => {
  initDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Initialize the database
function initDatabase() {
  try {
    const dbPath = isDev
      ? path.join(__dirname, '../data.db')  // Make sure this path exists
      : path.join(app.getPath('userData'), 'data.db');

    console.log('Database path:', dbPath);

    // Make sure parent directory exists
    const dbDir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize the database
    db = new Database(dbPath);
    console.log('Database initialized successfully');

    // Test the database connection
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    console.log('Existing tables:', tables);

    // Create example tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        pressure REAL NOT NULL,
        location TEXT NOT NULL,
        date TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        price REAL NOT NULL,
        weight REAL NOT NULL,
        rating REAL NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL
      );
    `);

    // Insert sample data if tables are empty
    const measurementCount = db.prepare('SELECT COUNT(*) as count FROM measurements').get().count;
    if (measurementCount === 0) {
      const insert = db.prepare(`
        INSERT INTO measurements (temperature, humidity, pressure, location, date)
        VALUES (?, ?, ?, ?, ?)
      `);

      const locations = ['Lab', 'Office', 'Warehouse', 'Outdoor'];

      for (let i = 0; i < 50; i++) {
        insert.run(
          (Math.random() * 30 + 10).toFixed(1),  // temperature between 10-40
          (Math.random() * 60 + 20).toFixed(1),  // humidity between 20-80
          (Math.random() * 50 + 950).toFixed(1), // pressure between 950-1000
          locations[Math.floor(Math.random() * locations.length)], // random location
          new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // random date within last 30 days
        );
      }
    }

    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
      const insert = db.prepare(`
        INSERT INTO products (price, weight, rating, category, name)
        VALUES (?, ?, ?, ?, ?)
      `);

      const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Tools'];
      const productNames = [
        'Laptop', 'Phone', 'Tablet', 'T-Shirt', 'Jeans', 'Bread', 'Milk',
        'Novel', 'Textbook', 'Hammer', 'Screwdriver', 'Headphones',
        'Camera', 'Sweater', 'Cake', 'Cheese', 'Biography', 'Drill'
      ];

      for (let i = 0; i < productNames.length; i++) {
        insert.run(
          (Math.random() * 900 + 10).toFixed(2),  // price between 10-910
          (Math.random() * 9 + 0.1).toFixed(2),   // weight between 0.1-9.1
          (Math.random() * 4 + 1).toFixed(1),     // rating between 1-5
          categories[Math.floor(Math.random() * categories.length)], // random category
          productNames[i]
        );
      }
    }
    console.log('Existing tables:', tables);

    console.log('Exiting initDatabase()');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw the error, just log it
    db = null; // Set db to null so we can check for it later
  }
}

ipcMain.handle('ping', () => {
  console.log('pong from main');
  return 'pong';
});

// IPC event handlers for database operations
// ipcMain.handle('get-tables', async () => {
//   try {
//     const database = ensureDb();
//     const tables = database.prepare(`
//       SELECT name FROM sqlite_master 
//       WHERE type='table' AND name NOT LIKE 'sqlite_%'
//     `).all();
//     return tables.map(t => t.name);
//   } catch (error) {
//     console.error('Error getting tables:', error);
//     throw error;
//   }
// });

// ipcMain.handle('get-table-columns', async (event, tableName) => {
//   try {
//     const database = ensureDb();
//     sql = `PRAGMA table_info("${tableName}");`;
//     const pragma = database.prepare(sql).all();
//     return pragma.map(col => ({
//       name: col.name,
//       type: col.type,
//       nullable: col.notnull === 0,
//       primaryKey: col.pk === 1
//     }));
//   } catch (error) {
//     console.error(`Error getting columns for table ${tableName}:`, error);
//     throw error;
//   }
// });

// ipcMain.handle('get-table-data', async (event, tableName) => {
//   try {
//     const database = ensureDb();
//     sql = `SELECT * FROM "${tableName}";`;
//     return database.prepare(sql).all();
//   } catch (error) {
//     console.error(`Error getting data from table ${tableName}:`, error);
//     throw error;
//   }
// });

// ipcMain.handle('add-data-point', async (event, tableName, data) => {
//   try {
//     const database = ensureDb();
//     const columns = Object.keys(data).join('", "');
//     const placeholders = Object.keys(data).map(() => '?').join(', ');
//     const values = Object.values(data);

//     // Create new row
//     sql = `INSERT INTO "${tableName}" ("${columns}") VALUES (${placeholders});`;
//     const stmt = database.prepare(sql);
//     const result = stmt.run(...values);

//     return { success: true, id: result.lastInsertRowid };
//   } catch (error) {
//     console.error(`Error adding data to table ${tableName}:`, error);
//     throw error;
//   }
// });