// routes/contact.js
// Réception et enregistrement du formulaire de contact (public/js/main.js -> POST /api/contact).
// Validation stricte côté serveur en complément de la validation HTML5 côté client.

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { sendNotificationEmail } = require('../utils/mailer');

const validators = [
  body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Le nom complet est requis (2 à 120 caractères).'),
  body('phone').trim().isLength({ min: 6, max: 30 }).withMessage('Le numéro de téléphone est requis.'),
  body('email').trim().isEmail().withMessage("L'adresse email n'est pas valide.").normalizeEmail(),
  body('subject').trim().isLength({ min: 2, max: 150 }).withMessage('Le sujet est requis.'),
  body('message').trim().isLength({ min: 5, max: 3000 }).withMessage('Le message doit contenir au moins 5 caractères.'),
];

router.post('/', validators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Formulaire invalide.', details: errors.array() });
  }

  const { full_name, phone, email, subject, message } = req.body;
  const stmt = db.prepare(`INSERT INTO messages (full_name, phone, email, subject, message)
    VALUES (?, ?, ?, ?, ?)`);
  const result = stmt.run(full_name, phone, email, subject, message);

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid,
    message: 'Merci pour votre message. Nous vous répondrons dans les meilleurs délais.',
  });

  // Notification par email (best-effort, ne bloque jamais la réponse au client)
  sendNotificationEmail(
    `📩 Nouveau message de contact — ${full_name}`,
    `<h2>Nouveau message de contact</h2>
     <p><strong>Nom :</strong> ${full_name}</p>
     <p><strong>Téléphone :</strong> ${phone}</p>
     <p><strong>Email :</strong> ${email}</p>
     <p><strong>Sujet :</strong> ${subject}</p>
     <p><strong>Message :</strong><br>${message.replace(/\n/g, '<br>')}</p>
     <p style="margin-top:20px;color:#888;font-size:0.85em;">Consultez et répondez depuis l'administration du site.</p>`
  );
});

module.exports = router;
