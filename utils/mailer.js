// utils/mailer.js
// Envoie des emails de notification (nouveau message, devis, commande) via SMTP.
//
// Conçu pour ne JAMAIS bloquer ni faire planter le site : si l'email n'est pas
// configuré (EMAIL_NOTIFICATIONS_ENABLED=false ou champs SMTP manquants), ou si
// l'envoi échoue pour une raison quelconque (mauvais mot de passe, pas de réseau,
// etc.), la fonction se contente de l'enregistrer dans la console et continue —
// la donnée est de toute façon déjà enregistrée en base de données à ce stade.

require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = null;
let initAttempted = false;

function isEmailEnabled() {
  return String(process.env.EMAIL_NOTIFICATIONS_ENABLED).toLowerCase() === 'true'
    && !!process.env.SMTP_HOST
    && !!process.env.SMTP_USER
    && !!process.env.SMTP_PASSWORD;
}

function getTransporter() {
  if (transporter || initAttempted) return transporter;
  initAttempted = true;

  if (!isEmailEnabled()) return null;

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE).toLowerCase() !== 'false', // true par défaut (port 465)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (err) {
    console.error('✖ Impossible d\'initialiser l\'envoi d\'emails :', err.message);
    transporter = null;
  }
  return transporter;
}

/**
 * Envoie un email de notification. Ne lève jamais d'erreur : les échecs sont
 * uniquement journalisés dans la console.
 * @param {string} subject
 * @param {string} html
 */
async function sendNotificationEmail(subject, html) {
  const t = getTransporter();
  if (!t) return; // notifications désactivées ou non configurées : on ne fait rien

  const to = process.env.NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL;
  if (!to) return;

  try {
    await t.sendMail({
      from: `"${process.env.BUSINESS_NAME || "Nel's Store & Decor"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✔ Email de notification envoyé : "${subject}"`);
  } catch (err) {
    console.error('✖ Échec de l\'envoi de l\'email de notification :', err.message);
  }
}

module.exports = { sendNotificationEmail, isEmailEnabled };
