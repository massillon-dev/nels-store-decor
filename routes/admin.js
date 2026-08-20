// routes/admin.js
// Toutes les routes ici sont protégées par requireAuth (voir server.js).
// Gestion complète : galerie (ajout/modification/suppression/réorganisation),
// réalisations, messages de contact, demandes de devis, statistiques du dashboard.

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { upload, UPLOAD_DIR, getMediaType, enforceImageSizeLimit } = require('../middleware/upload');

function safeDeleteUpload(imagePath) {
  // Ne supprime que les fichiers réellement dans /public/uploads (jamais les images de démo dans /public/images)
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(imagePath));
  fs.unlink(filePath, () => {}); // best-effort, ignore l'erreur si déjà absent
}

// ================= DASHBOARD =================
router.get('/stats', (req, res) => {
  const photos = db.prepare('SELECT COUNT(*) AS c FROM gallery').get().c;
  const quotes = db.prepare('SELECT COUNT(*) AS c FROM quotes').get().c;
  const messages = db.prepare('SELECT COUNT(*) AS c FROM messages').get().c;
  const unreadMessages = db.prepare('SELECT COUNT(*) AS c FROM messages WHERE is_read = 0').get().c;
  const projects = db.prepare('SELECT COUNT(*) AS c FROM realisations').get().c;
  const products = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  const orders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const newOrders = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'nouvelle'").get().c;
  res.json({ photos, quotes, messages, unreadMessages, projects, products, orders, newOrders });
});

// ================= GALERIE =================
router.get('/gallery', (req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all());
});

router.post('/gallery', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Le titre est requis.'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('La catégorie est requise.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  if (!req.file) return res.status(400).json({ error: 'Une photo ou une vidéo est requise.' });

  const { title, category, description } = req.body;
  const imagePath = `/uploads/${req.file.filename}`;
  const mediaType = getMediaType(req.file.mimetype);
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery').get().m;

  const result = db.prepare(`INSERT INTO gallery (title, category, description, image_path, media_type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)`).run(title, category, description || '', imagePath, mediaType, maxOrder + 1);

  res.status(201).json({ success: true, id: result.lastInsertRowid, image_path: imagePath, media_type: mediaType });
});

router.put('/gallery/:id', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('title').trim().isLength({ min: 1, max: 150 }),
  body('category').trim().isLength({ min: 1, max: 80 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Titre et catégorie requis.' });

  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Photo introuvable.' });

  const { title, category, description } = req.body;

  let imagePath = existing.image_path;
  let mediaType = existing.media_type || 'image';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
    mediaType = getMediaType(req.file.mimetype);
    safeDeleteUpload(existing.image_path);
  }

  db.prepare('UPDATE gallery SET title = ?, category = ?, description = ?, image_path = ?, media_type = ? WHERE id = ?')
    .run(title, category, description || '', imagePath, mediaType, req.params.id);

  res.json({ success: true, image_path: imagePath, media_type: mediaType });
});

router.delete('/gallery/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Photo introuvable.' });

  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  safeDeleteUpload(existing.image_path);

  res.json({ success: true });
});

// Réorganisation : reçoit un tableau ordonné d'IDs
router.post('/gallery/reorder', body('order').isArray(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Ordre invalide.' });

  const { order } = req.body;
  const update = db.prepare('UPDATE gallery SET sort_order = ? WHERE id = ?');
  const tx = db.transaction((ids) => {
    ids.forEach((id, index) => update.run(index, id));
  });
  tx(order);

  res.json({ success: true });
});

// ================= RÉALISATIONS =================
router.get('/realisations', (req, res) => {
  res.json(db.prepare('SELECT * FROM realisations ORDER BY sort_order ASC, created_at DESC').all());
});

router.get('/realisations/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM realisations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Réalisation introuvable.' });
  const photos = db.prepare('SELECT * FROM realisation_photos WHERE realisation_id = ? ORDER BY sort_order ASC').all(req.params.id);
  res.json({ ...row, photos });
});

router.post('/realisations', (req, res, next) => {
  upload.array('photos', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Le titre est requis.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { title, event_type, event_date, location, description } = req.body;
  const files = req.files || [];
  const coverImage = files.length > 0 ? `/uploads/${files[0].filename}` : '/images/decoration-1.jpg';
  const coverMediaType = files.length > 0 ? getMediaType(files[0].mimetype) : 'image';
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM realisations').get().m;

  const result = db.prepare(`INSERT INTO realisations
    (title, event_type, event_date, location, description, cover_image, cover_media_type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    title, event_type || '', event_date || '', location || '', description || '', coverImage, coverMediaType, maxOrder + 1
  );

  const insertPhoto = db.prepare('INSERT INTO realisation_photos (realisation_id, image_path, media_type, sort_order) VALUES (?, ?, ?, ?)');
  files.forEach((f, i) => insertPhoto.run(result.lastInsertRowid, `/uploads/${f.filename}`, getMediaType(f.mimetype), i));

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// Modifie une réalisation existante : titre/type/date/lieu/description, ET les photos/vidéos.
// - "existing_photos" (JSON, envoyé par le formulaire) : liste des médias déjà en ligne
//   que l'administrateur souhaite CONSERVER. Tout média existant absent de cette liste
//   est supprimé (base de données + fichier physique).
// - "photos" (fichiers) : nouveaux médias (photos ou vidéos) à ajouter à la suite des médias conservés.
// - La couverture est recalculée automatiquement : c'est toujours le premier
//   média de la liste finale (conservés, puis nouveaux).
router.put('/realisations/:id', (req, res, next) => {
  upload.array('photos', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Le titre est requis.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const existing = db.prepare('SELECT * FROM realisations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Réalisation introuvable.' });

  const { title, event_type, event_date, location, description } = req.body;

  // Médias existants à conserver (envoyés comme JSON stringifié depuis le formulaire)
  let keepPaths = [];
  try {
    keepPaths = req.body.existing_photos ? JSON.parse(req.body.existing_photos) : [];
    if (!Array.isArray(keepPaths)) keepPaths = [];
  } catch (e) {
    keepPaths = [];
  }

  const currentPhotos = db.prepare('SELECT * FROM realisation_photos WHERE realisation_id = ?').all(req.params.id);

  // Supprime (base + fichier) tout média existant qui n'est plus dans la liste à conserver
  const toRemove = currentPhotos.filter(p => !keepPaths.includes(p.image_path));
  const deleteStmt = db.prepare('DELETE FROM realisation_photos WHERE id = ?');
  toRemove.forEach(p => {
    deleteStmt.run(p.id);
    safeDeleteUpload(p.image_path);
  });

  // Réordonne les médias conservés selon l'ordre reçu, puis ajoute les nouveaux à la suite
  const updateOrder = db.prepare('UPDATE realisation_photos SET sort_order = ? WHERE id = ?');
  const keptPhotosByPath = new Map(currentPhotos.map(p => [p.image_path, p]));
  let orderIndex = 0;
  keepPaths.forEach(path => {
    const photo = keptPhotosByPath.get(path);
    if (photo) { updateOrder.run(orderIndex, photo.id); orderIndex += 1; }
  });

  const newFiles = req.files || [];
  const insertPhoto = db.prepare('INSERT INTO realisation_photos (realisation_id, image_path, media_type, sort_order) VALUES (?, ?, ?, ?)');
  newFiles.forEach((f) => {
    insertPhoto.run(req.params.id, `/uploads/${f.filename}`, getMediaType(f.mimetype), orderIndex);
    orderIndex += 1;
  });

  // Recalcule la couverture : le premier média de la liste finale (par ordre)
  const finalPhotos = db.prepare('SELECT * FROM realisation_photos WHERE realisation_id = ? ORDER BY sort_order ASC').all(req.params.id);
  const coverImage = finalPhotos.length > 0 ? finalPhotos[0].image_path : '/images/decoration-1.jpg';
  const coverMediaType = finalPhotos.length > 0 ? finalPhotos[0].media_type : 'image';

  db.prepare(`UPDATE realisations SET title = ?, event_type = ?, event_date = ?, location = ?, description = ?, cover_image = ?, cover_media_type = ? WHERE id = ?`)
    .run(title, event_type || '', event_date || '', location || '', description || '', coverImage, coverMediaType, req.params.id);

  res.json({ success: true, photos: finalPhotos, cover_image: coverImage });
});

router.delete('/realisations/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM realisations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Réalisation introuvable.' });

  const photos = db.prepare('SELECT * FROM realisation_photos WHERE realisation_id = ?').all(req.params.id);
  db.prepare('DELETE FROM realisations WHERE id = ?').run(req.params.id); // CASCADE supprime aussi les photos liées

  safeDeleteUpload(existing.cover_image);
  photos.forEach((p) => safeDeleteUpload(p.image_path));

  res.json({ success: true });
});

// ================= MESSAGES DE CONTACT =================
router.get('/messages', (req, res) => {
  res.json(db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all());
});

router.put('/messages/:id/read', (req, res) => {
  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ================= DEMANDES DE DEVIS =================
router.get('/quotes', (req, res) => {
  res.json(db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all());
});

router.put('/quotes/:id/status', body('status').trim().isLength({ min: 2, max: 40 }), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Statut invalide.' });
  db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

router.delete('/quotes/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  if (existing) safeDeleteUpload(existing.inspiration_image);
  db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ================= BOUTIQUE : PRODUITS =================
router.get('/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC').all());
});

router.post('/products', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Le nom du produit est requis.'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('La catégorie est requise.'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  if (!req.file) return res.status(400).json({ error: 'Une photo ou une vidéo est requise.' });

  const { name, category, description, price } = req.body;
  const inStock = req.body.in_stock === 'false' || req.body.in_stock === '0' ? 0 : 1;
  const imagePath = `/uploads/${req.file.filename}`;
  const mediaType = getMediaType(req.file.mimetype);
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM products').get().m;

  const result = db.prepare(`INSERT INTO products (name, category, description, price, image_path, media_type, in_stock, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(name, category, description || '', Number(price), imagePath, mediaType, inStock, maxOrder + 1);

  res.status(201).json({ success: true, id: result.lastInsertRowid, image_path: imagePath, media_type: mediaType });
});

router.put('/products/:id', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, [
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Le nom du produit est requis.'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('La catégorie est requise.'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  const { name, category, description, price } = req.body;
  const inStock = req.body.in_stock === 'false' || req.body.in_stock === '0' ? 0 : 1;

  let imagePath = existing.image_path;
  let mediaType = existing.media_type || 'image';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
    mediaType = getMediaType(req.file.mimetype);
    safeDeleteUpload(existing.image_path);
  }

  db.prepare(`UPDATE products SET name = ?, category = ?, description = ?, price = ?, image_path = ?, media_type = ?, in_stock = ? WHERE id = ?`)
    .run(name, category, description || '', Number(price), imagePath, mediaType, inStock, req.params.id);

  res.json({ success: true, image_path: imagePath, media_type: mediaType });
});

router.delete('/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  safeDeleteUpload(existing.image_path);

  res.json({ success: true });
});

// ================= BOUTIQUE : COMMANDES =================
router.get('/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const withItems = orders.map(o => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(withItems);
});

router.put('/orders/:id/status', body('status').trim().isLength({ min: 2, max: 40 }), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Statut invalide.' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

router.delete('/orders/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id); // CASCADE supprime aussi les articles liés
  res.json({ success: true });
});

// ================= IMAGES DU SITE (héro, intro, à propos) =================
const SITE_IMAGE_KEYS = ['hero', 'intro', 'about'];

router.get('/site-images', (req, res) => {
  const rows = db.prepare('SELECT key, image_path, media_type FROM site_images').all();
  const images = {};
  rows.forEach(r => { images[r.key] = { path: r.image_path, media_type: r.media_type || 'image' }; });
  res.json({
    hero: images.hero || { path: '/images/hero.jpg', media_type: 'image' },
    intro: images.intro || { path: '/images/intro.jpg', media_type: 'image' },
    about: images.about || { path: '/images/about.jpg', media_type: 'image' },
  });
});

router.post('/site-images/:key', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, enforceImageSizeLimit, (req, res) => {
  const { key } = req.params;
  if (!SITE_IMAGE_KEYS.includes(key)) {
    return res.status(400).json({ error: 'Image du site inconnue.' });
  }
  if (!req.file) return res.status(400).json({ error: 'Une photo ou une vidéo est requise.' });

  const newPath = `/uploads/${req.file.filename}`;
  const mediaType = getMediaType(req.file.mimetype);
  const existing = db.prepare('SELECT * FROM site_images WHERE key = ?').get(key);

  db.prepare(`INSERT INTO site_images (key, image_path, media_type, updated_at) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET image_path = excluded.image_path, media_type = excluded.media_type, updated_at = datetime('now')`)
    .run(key, newPath, mediaType);

  // Supprime l'ancienne image/vidéo seulement si c'était déjà un fichier téléversé
  // (jamais les images de démonstration d'origine dans /public/images)
  if (existing) safeDeleteUpload(existing.image_path);

  res.json({ success: true, image_path: newPath, media_type: mediaType });
});

module.exports = router;
