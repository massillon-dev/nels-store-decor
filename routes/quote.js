// routes/quote.js
// Réception et enregistrement des demandes de devis, avec upload optionnel
// d'une photo d'inspiration (public/js/main.js -> POST /api/quote, multipart/form-data).

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { upload } = require('../middleware/upload');
const db = require('../database/db');
const { sendNotificationEmail } = require('../utils/mailer');

const validators = [
  body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Le nom complet est requis.'),
  body('phone').trim().isLength({ min: 6, max: 30 }).withMessage('Le numéro de téléphone est requis.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage("L'adresse email n'est pas valide."),
  body('service_type').trim().isLength({ min: 2, max: 100 }).withMessage('Le type de prestation est requis.'),
];

router.post('/', (req, res, next) => {
  upload.single('inspiration_image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, validators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Formulaire invalide.', details: errors.array() });
  }

  const {
    full_name, phone, email, service_type,
    event_date, location, guest_count, budget, description,
  } = req.body;

  const inspirationPath = req.file ? `/uploads/${req.file.filename}` : null;

  const stmt = db.prepare(`INSERT INTO quotes
    (full_name, phone, email, service_type, event_date, location, guest_count, budget, description, inspiration_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(
    full_name, phone, email || null, service_type,
    event_date || null, location || null, guest_count || null, budget || null,
    description || null, inspirationPath
  );

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid,
    message: 'Merci ! Votre demande de devis a bien été envoyée. Nous vous contacterons rapidement.',
  });

  sendNotificationEmail(
    `🌸 Nouvelle demande de devis — ${full_name}`,
    `<h2>Nouvelle demande de devis</h2>
     <p><strong>Nom :</strong> ${full_name}</p>
     <p><strong>Téléphone :</strong> ${phone}</p>
     ${email ? `<p><strong>Email :</strong> ${email}</p>` : ''}
     <p><strong>Type de prestation :</strong> ${service_type}</p>
     ${event_date ? `<p><strong>Date souhaitée :</strong> ${event_date}</p>` : ''}
     ${location ? `<p><strong>Lieu :</strong> ${location}</p>` : ''}
     ${guest_count ? `<p><strong>Nombre de personnes :</strong> ${guest_count}</p>` : ''}
     ${budget ? `<p><strong>Budget :</strong> ${budget}</p>` : ''}
     ${description ? `<p><strong>Description :</strong><br>${description.replace(/\n/g, '<br>')}</p>` : ''}
     <p style="margin-top:20px;color:#888;font-size:0.85em;">Consultez le détail complet (et la photo d'inspiration éventuelle) depuis l'administration du site.</p>`
  );
});

module.exports = router;
