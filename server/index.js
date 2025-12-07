require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONFIGURAR TWILIO (Si fallan las claves, no explotará la app) ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
let client;

if (accountSid && authToken) {
  client = new twilio(accountSid, authToken);
} else {
  console.warn("⚠️ ADVERTENCIA: No se encontraron claves de Twilio en .env");
}

// --- 2. CONECTAR BASE DE DATOS (Corrección del error 'db not defined') ---
const db = new sqlite3.Database('./gastro.db', (err) => {
  if (err) console.error("Error al abrir BD:", err.message);
  else console.log('✅ Base de datos SQLite conectada.');
});

// --- 3. CREAR TABLAS ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, description TEXT, phone TEXT, address TEXT, coords TEXT, schedule TEXT, owner_id TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id INTEGER, name TEXT, price REAL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);

  // Tabla para guardar códigos temporales de SMS
  db.run(`CREATE TABLE IF NOT EXISTS verification_codes (
    phone TEXT PRIMARY KEY, code TEXT, created_at INTEGER
  )`);
});

// --- RUTAS DE SMS REALES ---

app.post('/api/send-code', async (req, res) => {
  const { phone } = req.body;
  if (!client) return res.status(500).json({ error: "Servidor no configurado para SMS" });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

  // 1. Guardar código en BD
  db.run("INSERT OR REPLACE INTO verification_codes (phone, code, created_at) VALUES (?, ?, ?)", 
    [phone, code, Date.now()], 
    async function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // 2. Enviar SMS real
      try {
        await client.messages.create({
          body: `Tu código de Gastro es: ${code}`,
          from: twilioPhone,
          to: phone
        });
        console.log(`📨 SMS enviado a ${phone}`);
        res.json({ success: true });
      } catch (twilioError) {
        console.error("Error Twilio:", twilioError);
        res.status(500).json({ error: twilioError.message });
      }
    }
  );
});

app.post('/api/verify-code', (req, res) => {
  const { phone, code } = req.body;
  db.get("SELECT code FROM verification_codes WHERE phone = ?", [phone], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row && row.code === code) {
      db.run("DELETE FROM verification_codes WHERE phone = ?", [phone]); // Borrar código usado
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Código incorrecto" });
    }
  });
});

// --- RUTAS DE RESTAURANTES ---

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

app.post('/api/restaurants', (req, res) => {
  const { name, description, phone, address, schedule, coords, ownerId, menu } = req.body;
  const sql = `INSERT INTO restaurants (name, description, phone, address, schedule, coords, owner_id) VALUES (?,?,?,?,?,?,?)`;
  
  db.run(sql, [name, description, phone, address, schedule, coords, ownerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const newId = this.lastID;
    
    if (menu && menu.length > 0) {
      const stmt = db.prepare(`INSERT INTO menu_items (restaurant_id, name, price) VALUES (?,?,?)`);
      menu.forEach(m => stmt.run(newId, m.name, m.price));
      stmt.finalize();
    }
    res.json({ id: newId });
  });
});

app.delete('/api/restaurants/:id', (req, res) => {
  db.run("DELETE FROM restaurants WHERE id = ?", req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Eliminado" });
  });
});

app.listen(3001, () => {
  console.log('🚀 Servidor listo en http://localhost:3001');
});