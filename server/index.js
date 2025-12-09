const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Base de datos
const db = new sqlite3.Database('./gastro.db', (err) => {
  if (err) console.error('Error al conectar DB:', err.message);
  else console.log('Conectado a la base de datos SQLite.');
});

// Inicialización de tablas (Solo restaurantes y menús)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    image TEXT,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);
  
  // NOTA: Se eliminó la tabla 'verification_codes' porque Firebase maneja eso ahora.
});

// --- RUTAS DE RESTAURANTES (Se mantienen igual) ---

app.get('/api/restaurants', (req, res) => {
  db.all("SELECT * FROM restaurants", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/restaurants', (req, res) => {
  const { name, description, address, phone, image } = req.body;
  db.run("INSERT INTO restaurants (name, description, address, phone, image) VALUES (?, ?, ?, ?, ?)", 
    [name, description, address, phone, image], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Obtener detalles de un restaurante
app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM restaurants WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  });
});

// --- RUTAS DE MENÚ (Se mantienen igual) ---

app.get('/api/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM menu_items WHERE restaurant_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  db.run("INSERT INTO menu_items (restaurant_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)", 
    [id, name, description, price, image], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});