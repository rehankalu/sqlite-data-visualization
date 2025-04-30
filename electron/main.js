console.log("Electron main process starting...")
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');

let db;
let mainWindow;

// IPC event handlers for database operations
ipcMain.handle('get-tables', async () => {
  try {
    const tables = await db.all(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
`, (err) => {
      if (err) {
        console.error('Failed to retrieve tables:', err.message);
        return;
      }
    });
    var tableNames = [];
    tables.forEach(function (entry) {
      tableNames.push(entry.name)
    });
    return tableNames;
  } catch (error) {
    console.error('Error getting tables:', error);
    throw error;
  }
});

ipcMain.handle('get-table-columns', async (event, tableName) => {
  try {
    sql = `PRAGMA table_info("${tableName}");`;
    pragma = await db.all(sql, (err) => {
      if (err) {
        console.error(`Failed to get table info for ${tableName}:`, err.message);
        return;
      }
    });

    return pragma.map(col => ({
      name: col.name,
      type: col.type,
      nullable: col.notnull === 0,
      primaryKey: col.pk === 1
    }));
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    throw error;
  }
});

ipcMain.handle('get-table-data', async (event, tableName) => {
  try {
    sql = `SELECT * FROM "${tableName}";`;
    return db.all(sql, (err) => {
      if (err) {
        console.error(`Failed to get table info for ${tableName}:`, err.message);
        return;
      }
    });
  } catch (error) {
    console.error(`Error getting data from table ${tableName}:`, error);
    throw error;
  }
});


ipcMain.handle('add-data-point', async (event, tableName, data) => {
  try {
    const columns = Object.keys(data).join('", "');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    // Create new row
    const sql = `INSERT INTO "${tableName}" (\"${columns}\") VALUES (${placeholders});`;

    const result = db.run(sql, values, function (err) {
      if (err) {
        console.error(`Failed to insert into ${tableName}:`, err.message);
        return;
      }
    });
    
    return { success: true, id: result.lastID };

  } catch (error) {
    console.error(`Error adding data to table ${tableName}:`, error);
    throw error;
  }
});

ipcMain.handle('add-data-table', async (event, filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length !== 1) {
      console.error('Excel file must contain exactly one sheet.');
      return;
    }

    const sheetName = sheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length < 2) {
      console.error('Excel must have a header and at least one data row.');
      return;
    }

    const headers = data[0];
    const rows = data.slice(1);

    // === Table Name based on file name (or timestamp) ===
    const baseName = path.basename(filePath, path.extname(filePath));
    const safeName = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
    const tableName = `excel_${safeName}_${Date.now()}`;

    const columnDefs = headers.map(h => `"${h}" TEXT`).join(', ');
    const placeholders = headers.map(() => '?').join(', ');

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`);

      const stmt = db.prepare(
        `INSERT INTO "${tableName}" (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${placeholders})`
      );

      rows.forEach(row => {
        const values = headers.map((_, i) => row[i] || null);
        stmt.run(values);
      });

      stmt.finalize(() => {
        console.log(`✅ Data inserted into table "${tableName}"`);
        db.close();
      });
    });
    return tableName;
  } catch (err) {
    console.error('Error processing Excel:', err);
  }

});

ipcMain.handle('select-excel', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
    properties: ['openFile'],
  });
  if (!canceled && filePaths[0]) {
    const filePath = filePaths[0];
    // continue processing
    processExcelFile(filePath);
  }
});

app.whenReady().then(async () => {
  try {
    await initDatabase();
    createWindow();
  } catch (e) {
    console.error('Error creating window:', e);
  }
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

function createWindow() {
  console.log("Attempting to open window");
  try {
    const preloadPath = path.join(__dirname, 'preload.js');
    console.log('Preload script path:', preloadPath);

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      // show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
        devTools: true,
        webSecurity: false // important for dev server
      },
    });

    if (isDev) {
      console.log('Running in development');
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load URL:', errorDescription);
    });

    mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('Renderer process gone:', details);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (err) {
    console.error('Error in createWindow:', err);
  }
}

async function createDatabase(isDev) {
  let dbPath;

  if (isDev) {
    dbPath = path.join(__dirname, '../data.db')
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    if (db) console.log("db created")
  } else {
    dbPath = path.join(app.getPath('userData'), 'data.db');
    // Initialize the database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('DB connection error:', err.message);
    });
    console.log('Database initialized successfully');
  }

  return dbPath
}

function createSchema() {
  const schemaSQL = `
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
    `;

  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Tables created or already exist.');
    }
  });
}

function initMeasurements() {
  const locations = ['Lab', 'Office', 'Warehouse', 'Outdoor'];

  // Check if there are any measurements
  db.get('SELECT COUNT(*) as count FROM measurements', (err, row) => {

    console.log("Counting DB entries");
    if (err) {
      console.error('Error counting measurements:', err.message);
      return;
    }

    const measurementCount = row.count;
    console.log(measurementCount);

    if (measurementCount === 0) {
      const insertSql = `
      INSERT INTO measurements (temperature, humidity, pressure, location, date)
      VALUES (?, ?, ?, ?, ?)
    `;

      db.serialize(() => {
        const stmt = db.prepare(insertSql);

        for (let i = 0; i < 50; i++) {
          const temperature = (Math.random() * 30 + 10).toFixed(1);  // 10–40°C
          const humidity = (Math.random() * 60 + 20).toFixed(1);     // 20–80%
          const pressure = (Math.random() * 50 + 950).toFixed(1);    // 950–1000 hPa
          const location = locations[Math.floor(Math.random() * locations.length)];
          const daysAgo = Math.floor(Math.random() * 30);
          const date = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

          stmt.run(temperature, humidity, pressure, location, date);
        }

        stmt.finalize((err) => {
          if (err) {
            console.error('Failed to finalize statement:', err.message);
          } else {
            console.log('Inserted 50 random measurements.');
          }
        });
      });
    } else {
      console.log(`Measurements already exist: count = ${measurementCount}`);
    }
  });

  console.log("Exiting initMeasurements");
}

function initProducts() {
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Tools'];
  const productNames = [
    'Laptop', 'Phone', 'Tablet', 'T-Shirt', 'Jeans', 'Bread', 'Milk',
    'Novel', 'Textbook', 'Hammer', 'Screwdriver', 'Headphones',
    'Camera', 'Sweater', 'Cake', 'Cheese', 'Biography', 'Drill'
  ];

  // Check if any products exist
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error querying product count:', err.message);
      return;
    }

    const productCount = row.count;

    if (productCount === 0) {
      const insertSql = `
        INSERT INTO products (price, weight, rating, category, name)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.serialize(() => {
        const stmt = db.prepare(insertSql);

        for (let i = 0; i < productNames.length; i++) {
          const price = (Math.random() * 900 + 10).toFixed(2);    // 10–910
          const weight = (Math.random() * 9 + 0.1).toFixed(2);     // 0.1–9.1
          const rating = (Math.random() * 4 + 1).toFixed(1);       // 1–5
          const category = categories[Math.floor(Math.random() * categories.length)];
          const name = productNames[i];

          stmt.run(price, weight, rating, category, name);
        }

        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing insert statement:', err.message);
          } else {
            console.log('Inserted sample products successfully.');
          }
        });
      });
    } else {
      console.log(`Products already exist: count = ${productCount}`);
    }
  });
}

// Initialize the database
async function initDatabase() {
  try {
    let dbPath;
    dbPath = await createDatabase(isDev);

    console.log('Database path:', dbPath);

    // Make sure parent directory exists
    const dbDir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Test the database connection
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

    // Create example tables if they don't exist
    createSchema();

    // Insert sample data if tables are empty
    initMeasurements();
    initProducts();

    console.log('Existing tables:', tables);

    console.log('Exiting initDatabase()');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw the error, just log it
    db = null; // Set db to null so we can check for it later
  }
}

async function processExcelFile(filePath) {
  console.log("Processing file:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  const workbook = XLSX.readFile(filePath);
  if (workbook.SheetNames.length !== 1) {
    console.error('The Excel file must contain exactly one sheet.');
    return;
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (data.length < 2) {
    console.error('The sheet must contain at least one header row and one data row.');
    return;
  }

  const headers = data[0].map(h => h.toString().replace(/"/g, '""')); // escape quotes
  const rows = data.slice(1);

  const tableName = 'uploaded_data';

  db.serialize(() => {
    const columnDefs = headers.map(h => `"${h}" TEXT`).join(', ');
    db.run(`DROP TABLE IF EXISTS ${tableName}`);
    db.run(`CREATE TABLE ${tableName} (${columnDefs});`);

    const placeholders = headers.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO ${tableName} (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${placeholders})`;
    const stmt = db.prepare(insertSQL);

    rows.forEach(row => {
      const paddedRow = headers.map((_, i) => row[i] ?? null);
      stmt.run(paddedRow);
    });

    stmt.finalize();

    db.all(`SELECT * FROM ${tableName}`, [], (err, resultRows) => {
      if (err) {
        console.error('Error querying database:', err.message);
      } else {
        console.log("Data inserted successfully:");
        console.table(resultRows);
      }

      db.close();
    });
  });
}