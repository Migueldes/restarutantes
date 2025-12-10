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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    image TEXT,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
  )`);
});

// --- OBTENER TODOS (CON MENÚ) ---
app.get('/api/restaurants', (req, res) => {
  db.all("SELECT * FROM restaurants", [], async (err, restaurants) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const list = await Promise.all(restaurants.map(async (rest) => {
        return new Promise((resolve) => {
          db.all("SELECT * FROM menu_items WHERE restaurant_id = ?", [rest.id], (_, menu) => {
            resolve({ ...rest, menu: menu || [] });
          });
        });
      }));
      res.json(list);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
});

// --- CREAR NUEVO (AHORA GUARDA EL MENÚ) ---
app.post('/api/restaurants', (req, res) => {
  const { name, description, address, phone, image, schedule, coords, ownerId, menu } = req.body;
  
  const sql = `INSERT INTO restaurants (name, description, address, phone, image, schedule, coords, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, description, address, phone, image, schedule, coords, ownerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const restaurantId = this.lastID;

    // ¡AQUÍ ESTÁ LA MAGIA! Guardamos el menú
    if (menu && menu.length > 0) {
      const stmt = db.prepare("INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)");
      menu.forEach(item => {
        stmt.run(restaurantId, item.name, item.price);
      });
      stmt.finalize();
    }
    
    res.json({ id: restaurantId });
  });
});

// --- ACTUALIZAR (PUT) ---
app.put('/api/restaurants/:id', (req, res) => {
  const { name, description, address, phone, schedule, coords, menu } = req.body;
  const id = req.params.id;

  db.run(
    `UPDATE restaurants SET name=?, description=?, address=?, phone=?, schedule=?, coords=? WHERE id=?`,
    [name, description, address, phone, schedule, coords, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Actualizar menú: Borramos los viejos y ponemos los nuevos (más fácil)
      db.run("DELETE FROM menu_items WHERE restaurant_id = ?", [id], () => {
        if (menu && menu.length > 0) {
          const stmt = db.prepare("INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)");
          menu.forEach(item => stmt.run(id, item.name, item.price));
          stmt.finalize();
        }
        res.json({ success: true });
      });
    }
  );
});

// --- BORRAR ---
app.delete('/api/restaurants/:id', (req, res) => {
  db.run("DELETE FROM restaurants WHERE id = ?", req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run("DELETE FROM menu_items WHERE restaurant_id = ?", req.params.id);
    res.json({ message: "Eliminado" });
  });
});

app.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});