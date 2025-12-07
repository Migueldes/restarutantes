const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- BASE DE DATOS SQLITE ---
// Esto creará un archivo 'gastro.db' automáticamente en la carpeta server
const db = new sqlite3.Database('./gastro.db', (err) => {
  if (err) console.error("Error al abrir BD:", err.message);
  else console.log('✅ Base de datos conectada.');
});

// Crear tablas automáticamente si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    phone TEXT,
    address TEXT,
    coords TEXT,
    schedule TEXT,
    owner_id TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT,
    price REAL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);
  
  // Insertar datos de prueba SOLO si la tabla está vacía
  db.get("SELECT count(*) as count FROM restaurants", (err, row) => {
    if (row.count === 0) {
      console.log("Insertando datos de prueba...");
      const stmt = db.prepare("INSERT INTO restaurants (name, description, phone, address, schedule, owner_id) VALUES (?,?,?,?,?,?)");
      stmt.run("El Fogón", "Comida casera", "5551234567", "Calle 1", "9am-6pm", "user1");
      stmt.finalize();
    }
  });
});

// --- RUTAS (API) ---

// 1. Obtener restaurantes
app.get('/api/restaurants', (req, res) => {
  db.all("SELECT * FROM restaurants", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Guardar restaurante
app.post('/api/restaurants', (req, res) => {
  const { name, description, phone, address, schedule, ownerId } = req.body;
  const sql = `INSERT INTO restaurants (name, description, phone, address, schedule, owner_id) VALUES (?,?,?,?,?,?)`;
  
  db.run(sql, [name, description, phone, address, schedule, ownerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: "Guardado exitosamente" });
  });
});

// 3. Eliminar restaurante
app.delete('/api/restaurants/:id', (req, res) => {
  db.run("DELETE FROM restaurants WHERE id = ?", req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Eliminado" });
  });
});

// Iniciar servidor
app.listen(3001, () => {
  console.log('🚀 Servidor listo en http://localhost:3001');
});