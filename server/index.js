// server/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./gastro.db', (err) => {
  if (err) console.error('Error DB:', err.message);
  else console.log('Base de datos conectada.');
});

// --- 1. TABLAS CORREGIDAS (Con owner_id y schedule) ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    image TEXT,
    schedule TEXT,
    coords TEXT,
    owner_id TEXT
  )`); // ^^^ Agregamos schedule, coords y owner_id

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    image TEXT,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);
});

// --- 2. RUTAS CORREGIDAS ---

app.get('/api/restaurants', (req, res) => {
  db.all("SELECT * FROM restaurants", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/restaurants', (req, res) => {
  // Ahora recibimos y guardamos schedule y owner_id
  const { name, description, address, phone, image, schedule, coords, ownerId } = req.body;
  
  const sql = `INSERT INTO restaurants (name, description, address, phone, image, schedule, coords, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, description, address, phone, image, schedule, coords, ownerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/restaurants/:id', (req, res) => {
  db.get("SELECT * FROM restaurants WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// Rutas de menú (sin cambios)
app.get('/api/restaurants/:id/menu', (req, res) => {
  db.all("SELECT * FROM menu_items WHERE restaurant_id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/restaurants/:id/menu', (req, res) => {
  const { name, description, price, image } = req.body;
  db.run("INSERT INTO menu_items (restaurant_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)", 
    [req.params.id, name, description, price, image], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/restaurants/:id', (req, res) => {
    db.run("DELETE FROM restaurants WHERE id = ?", req.params.id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Eliminado" });
    });
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});