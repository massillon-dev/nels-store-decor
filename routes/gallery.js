// routes/gallery.js
// Routes publiques (lecture seule) pour la galerie de photos.
// Les opérations d'écriture (ajout / modification / suppression) sont dans routes/admin.js
// et protégées par authentification.

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/gallery -> toutes les photos, triées par ordre puis date
// GET /api/gallery?category=Bouquets -> filtré par catégorie
router.get('/', (req, res) => {
  const { category } = req.query;
  let rows;
  if (category && category !== 'Toutes') {
    rows = db.prepare('SELECT * FROM gallery WHERE category = ? ORDER BY sort_order ASC, created_at DESC').all(category);
  } else {
    rows = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all();
  }
  res.json(rows);
});

// GET /api/gallery/categories -> liste des catégories distinctes présentes en base
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM gallery ORDER BY category ASC').all();
  res.json(rows.map(r => r.category));
});

// GET /api/gallery/:id -> une photo précise (pour la lightbox / navigation)
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Photo introuvable.' });
  res.json(row);
});

module.exports = router;
