// routes/realisations.js
// Routes publiques (lecture seule) pour la page "Réalisations".

const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM realisations ORDER BY sort_order ASC, created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM realisations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Réalisation introuvable.' });
  const photos = db.prepare('SELECT * FROM realisation_photos WHERE realisation_id = ? ORDER BY sort_order ASC').all(req.params.id);
  res.json({ ...row, photos });
});

module.exports = router;
