// routes/orders.js
// Réception des commandes de la boutique (panier + formulaire groupé).
// Le total est TOUJOURS recalculé côté serveur à partir des prix actuels en base
// (on ne fait jamais confiance aux prix envoyés par le navigateur).

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { sendNotificationEmail } = require('../utils/mailer');

const validators = [
  body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Le nom complet est requis.'),
  body('phone').trim().isLength({ min: 6, max: 30 }).withMessage('Le numéro de téléphone est requis.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage("L'adresse email n'est pas valide."),
  body('address').trim().isLength({ min: 3, max: 250 }).withMessage("L'adresse de livraison est requise."),
  body('items').isArray({ min: 1 }).withMessage('Le panier est vide.'),
];

router.post('/', validators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { full_name, phone, email, address, delivery_date, notes, items } = req.body;

  // Valide et recalcule chaque article à partir de la base (jamais du panier client)
  const resolvedItems = [];
  for (const item of items) {
    const productId = Number(item.product_id);
    const quantity = Math.max(1, Math.min(50, parseInt(item.quantity, 10) || 1));
    if (!productId) continue;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) continue;
    resolvedItems.push({ product_id: product.id, product_name: product.name, unit_price: product.price, quantity });
  }

  if (resolvedItems.length === 0) {
    return res.status(400).json({ error: 'Aucun article valide dans le panier.' });
  }

  const total = resolvedItems.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);

  const insertOrder = db.prepare(`INSERT INTO orders
    (full_name, phone, email, address, delivery_date, notes, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertItem = db.prepare(`INSERT INTO order_items
    (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)`);

  const tx = db.transaction(() => {
    const result = insertOrder.run(full_name, phone, email || null, address, delivery_date || null, notes || null, total);
    resolvedItems.forEach(it => insertItem.run(result.lastInsertRowid, it.product_id, it.product_name, it.unit_price, it.quantity));
    return result.lastInsertRowid;
  });

  const orderId = tx();

  res.status(201).json({
    success: true,
    id: orderId,
    total,
    message: 'Merci pour votre commande ! Nous vous contacterons rapidement pour confirmer les détails et le paiement.',
  });

  const itemsHtml = resolvedItems.map(it =>
    `<tr><td style="padding:4px 10px 4px 0;">${it.product_name} × ${it.quantity}</td><td style="padding:4px 0;text-align:right;">${(it.unit_price * it.quantity).toLocaleString('fr-FR')} HTG</td></tr>`
  ).join('');

  sendNotificationEmail(
    `🛍️ Nouvelle commande boutique — ${full_name} (${total.toLocaleString('fr-FR')} HTG)`,
    `<h2>Nouvelle commande boutique #${orderId}</h2>
     <p><strong>Nom :</strong> ${full_name}</p>
     <p><strong>Téléphone :</strong> ${phone}</p>
     ${email ? `<p><strong>Email :</strong> ${email}</p>` : ''}
     <p><strong>Adresse de livraison :</strong> ${address}</p>
     ${delivery_date ? `<p><strong>Date souhaitée :</strong> ${delivery_date}</p>` : ''}
     ${notes ? `<p><strong>Remarques :</strong><br>${notes.replace(/\n/g, '<br>')}</p>` : ''}
     <table style="margin-top:14px;border-collapse:collapse;width:100%;max-width:400px;">
       ${itemsHtml}
       <tr style="font-weight:bold;border-top:1px solid #ddd;"><td style="padding:8px 10px 4px 0;">Total</td><td style="padding:8px 0;text-align:right;">${total.toLocaleString('fr-FR')} HTG</td></tr>
     </table>
     <p style="margin-top:20px;color:#888;font-size:0.85em;">Consultez et confirmez cette commande depuis l'administration du site.</p>`
  );
});

module.exports = router;
