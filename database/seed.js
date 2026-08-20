// database/seed.js
// Insère un compte administrateur et des données de démonstration
// UNIQUEMENT si les tables sont vides (ne duplique jamais les données).
// Exécuté automatiquement au démarrage du serveur (voir server.js) et via `npm run seed`.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

function seed() {
  // --- Compte administrateur ---
  const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
    console.log(`✔ Compte administrateur créé (utilisateur: "${username}")`);
  }

  // --- Galerie de démonstration ---
  const galleryCount = db.prepare('SELECT COUNT(*) AS c FROM gallery').get().c;
  if (galleryCount === 0) {
    const demoGallery = [
      ['Bouquet Romance Rosée', 'Bouquets', "Un bouquet rond de roses roses et blanches, sublimé par un feuillage délicat.", '/images/bouquet-1.jpg'],
      ['Bouquet Élégance Champêtre', 'Bouquets', "Composition libre aux tons pastel pour une allure naturelle et raffinée.", '/images/bouquet-2.jpg'],
      ['Allée Florale de Mariage', 'Mariages', "Décoration d'allée en fleurs naturelles et voilages pour cérémonie en plein air.", '/images/mariage-1.jpg'],
      ['Arche Nuptiale Dorée', 'Mariages', "Arche florale rehaussée de détails dorés, pièce maîtresse de la cérémonie.", '/images/mariage-2.jpg'],
      ['Cocktail Corporate Chic', 'Événements', "Mise en scène florale sobre et élégante pour événement d'entreprise.", '/images/evenement-1.jpg'],
      ['Anniversaire Éclat Rosé', 'Événements', "Décoration festive et raffinée pour une célébration mémorable.", '/images/evenement-2.jpg'],
      ['Salon Cocon Fleuri', 'Décoration', "Arrangement d'intérieur apportant douceur et élégance à votre salon.", '/images/decoration-1.jpg'],
      ["Table d'Accueil Signature", 'Décoration', "Décor d'entrée soigné, premier regard qui marque les esprits.", '/images/decoration-2.jpg'],
      ['Centre de Table Doré', 'Compositions florales', "Composition basse en roses et feuillages dorés pour vos tables.", '/images/composition-1.jpg'],
      ['Composition Haute Prestige', 'Compositions florales', "Pièce florale imposante pour sublimer un espace de réception.", '/images/composition-2.jpg'],
    ];
    const insert = db.prepare('INSERT INTO gallery (title, category, description, image_path, sort_order) VALUES (?, ?, ?, ?, ?)');
    demoGallery.forEach((row, i) => insert.run(...row, i));
    console.log(`✔ ${demoGallery.length} photos de démonstration ajoutées à la galerie`);
  }

  // --- Réalisations de démonstration ---
  const realCount = db.prepare('SELECT COUNT(*) AS c FROM realisations').get().c;
  if (realCount === 0) {
    const insertReal = db.prepare(`INSERT INTO realisations
      (title, event_type, event_date, location, description, cover_image, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const insertPhoto = db.prepare('INSERT INTO realisation_photos (realisation_id, image_path, sort_order) VALUES (?, ?, ?)');

    const r1 = insertReal.run(
      'Décoration florale – Mariage Aline & Marc',
      'Mariage', '2026-02-14', 'Pétion-Ville, Haïti',
      "Création d'une décoration florale élégante composée de roses, feuillages naturels et compositions personnalisées pour sublimer la cérémonie et la réception.",
      '/images/mariage-1.jpg', 0
    );
    [ '/images/mariage-1.jpg', '/images/mariage-2.jpg', '/images/composition-1.jpg' ].forEach((p, i) => insertPhoto.run(r1.lastInsertRowid, p, i));

    const r2 = insertReal.run(
      'Décoration corporate – Lancement de marque',
      'Événement', '2026-03-20', 'Pétion-Ville, Haïti',
      "Une mise en scène florale raffinée et minimaliste pour l'inauguration d'un espace commercial haut de gamme.",
      '/images/evenement-1.jpg', 1
    );
    [ '/images/evenement-1.jpg', '/images/decoration-2.jpg' ].forEach((p, i) => insertPhoto.run(r2.lastInsertRowid, p, i));

    console.log('✔ Réalisations de démonstration ajoutées');
  }

  // --- Témoignages de démonstration ---
  const testCount = db.prepare('SELECT COUNT(*) AS c FROM testimonials').get().c;
  if (testCount === 0) {
    const insertT = db.prepare('INSERT INTO testimonials (client_name, event_type, content, rating, sort_order) VALUES (?, ?, ?, ?, ?)');
    const demoT = [
      ['Aline J.', 'Mariage', "Une équipe à l'écoute et un travail d'une finesse incroyable. Nos invités ne parlaient que de la décoration florale !", 5, 0],
      ['Ronald P.', 'Anniversaire', "Créations magnifiques, livrées à temps, et un rapport qualité-prix vraiment juste. Je recommande vivement.", 5, 1],
      ['Nadège M.', 'Décoration intérieure', "Mon salon a été complètement transformé. Un vrai talent artistique, très professionnel du début à la fin.", 5, 2],
    ];
    demoT.forEach((row) => insertT.run(...row));
    console.log('✔ Témoignages de démonstration ajoutés');
  }

  // --- Produits de démonstration (boutique) ---
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (productCount === 0) {
    const insertP = db.prepare(`INSERT INTO products
      (name, category, description, price, image_path, in_stock, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const demoProducts = [
      ['Bouquet Classique Rosé', 'Bouquets', "Un bouquet rond de roses fraîches, élégant et intemporel, idéal pour toute occasion.", 1500, '/images/product-bouquet-classique.jpg', 1, 0],
      ['Bouquet Luxe Signature', 'Bouquets', "Notre plus belle composition, mêlant roses premium, feuillages nobles et détails dorés.", 3200, '/images/product-bouquet-luxe.jpg', 1, 1],
      ['Coffret Cadeau Élégance', 'Coffrets cadeaux', "Un coffret soigné associant fleurs et petites douceurs, parfait pour surprendre.", 2200, '/images/product-coffret-cadeau.jpg', 1, 2],
      ['Coffret Premium Prestige', 'Coffrets cadeaux', "Notre coffret le plus raffiné : fleurs, chocolat fin et emballage haut de gamme.", 4500, '/images/product-coffret-premium.jpg', 1, 3],
      ['Composition Table Dorée', 'Compositions florales', "Composition basse en roses et feuillages dorés, parfaite pour une table d'exception.", 1800, '/images/product-composition-table.jpg', 1, 4],
      ['Composition Prestige', 'Compositions florales', "Une pièce florale imposante et raffinée pour sublimer un espace de réception.", 3800, '/images/product-composition-luxe.jpg', 1, 5],
      ['Vase Décoratif Fleuri', 'Décoration intérieure', "Un vase garni de fleurs durables, pour apporter douceur à votre intérieur toute l'année.", 2500, '/images/product-vase-decor.jpg', 1, 6],
      ['Couronne de Fleurs', 'Décoration intérieure', "Couronne artisanale en fleurs séchées et naturelles, pour une décoration murale élégante.", 2000, '/images/product-couronne-fleurs.jpg', 1, 7],
    ];
    demoProducts.forEach((row) => insertP.run(...row));
    console.log(`✔ ${demoProducts.length} produits de démonstration ajoutés à la boutique`);
  }

  // --- Images personnalisables du site (héro, intro, à propos) ---
  // Valeurs par défaut = images de démonstration déjà présentes dans /public/images.
  // Modifiables ensuite depuis l'administration (Paramètres > Images du site) sans toucher au code.
  const siteImageDefaults = {
    hero: '/images/hero.jpg',
    intro: '/images/intro.jpg',
    about: '/images/about.jpg',
  };
  const insertImg = db.prepare('INSERT OR IGNORE INTO site_images (key, image_path) VALUES (?, ?)');
  Object.entries(siteImageDefaults).forEach(([key, path]) => insertImg.run(key, path));
}

seed();

module.exports = seed;
