// routes/testimonials.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC').all();
  res.json(rows);
});

module.exports = router;
