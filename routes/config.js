// routes/config.js
// Expose au frontend les informations publiques de l'entreprise
// (téléphones, WhatsApp, email, adresse, réseaux sociaux) depuis la configuration centralisée,
// ainsi que les images personnalisables du site (héro, intro, à propos).

const express = require('express');
const router = express.Router();
const { getSiteConfig } = require('../config/site');
const db = require('../database/db');

function getSiteImages() {
  const rows = db.prepare('SELECT key, image_path, media_type FROM site_images').all();
  const images = {};
  rows.forEach(r => { images[r.key] = { path: r.image_path, mediaType: r.media_type || 'image' }; });
  // Valeurs de repli si la table est vide ou qu'une clé manque encore
  return {
    hero: images.hero || { path: '/images/hero.jpg', mediaType: 'image' },
    intro: images.intro || { path: '/images/intro.jpg', mediaType: 'image' },
    about: images.about || { path: '/images/about.jpg', mediaType: 'image' },
  };
}

router.get('/', (req, res) => {
  res.json({ ...getSiteConfig(), images: getSiteImages() });
});

module.exports = router;
module.exports.getSiteImages = getSiteImages;
