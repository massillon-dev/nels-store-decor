// routes/products.js
// Routes publiques (lecture seule) pour la boutique.

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/products -> tous les produits en stock, triés
// GET /api/products?category=Bouquets -> filtré par catégorie
router.get('/', (req, res) => {
  const { category } = req.query;
  let rows;
  if (category && category !== 'Tous') {
    rows = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY sort_order ASC, created_at DESC').all(category);
  } else {
    rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC').all();
  }
  res.json(rows);
});

router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
  res.json(rows.map(r => r.category));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(row);
});

module.exports = router;
