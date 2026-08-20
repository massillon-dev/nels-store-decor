// database/db.js
// Connexion SQLite centralisée + création du schéma (tables) si nécessaire.
// Utilise better-sqlite3 (synchrone, rapide, idéal pour un site vitrine).

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schéma ---
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS realisations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_type TEXT,
  event_date TEXT,
  location TEXT,
  description TEXT,
  cover_image TEXT,
  cover_media_type TEXT DEFAULT 'image',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS realisation_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  realisation_id INTEGER NOT NULL REFERENCES realisations(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT NOT NULL,
  event_date TEXT,
  location TEXT,
  guest_count TEXT,
  budget TEXT,
  description TEXT,
  inspiration_image TEXT,
  status TEXT DEFAULT 'nouveau',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  event_type TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  in_stock INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  delivery_date TEXT,
  notes TEXT,
  total REAL NOT NULL,
  status TEXT DEFAULT 'nouvelle',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS site_images (
  key TEXT PRIMARY KEY,
  image_path TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  updated_at TEXT DEFAULT (datetime('now'))
);
`);

// --- Migration légère : ajoute les colonnes manquantes aux bases de données
// déjà existantes (créées avant l'ajout du support vidéo), sans jamais
// supprimer ni écraser les données déjà en place. ---
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✔ Colonne "${column}" ajoutée à la table "${table}" (mise à jour de la base existante)`);
  }
}

ensureColumn('gallery', 'media_type', "TEXT DEFAULT 'image'");
ensureColumn('realisations', 'cover_media_type', "TEXT DEFAULT 'image'");
ensureColumn('realisation_photos', 'media_type', "TEXT DEFAULT 'image'");
ensureColumn('products', 'media_type', "TEXT DEFAULT 'image'");
ensureColumn('site_images', 'media_type', "TEXT DEFAULT 'image'");

module.exports = db;
