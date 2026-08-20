// server.js
// Point d'entrée de l'application Nel's Store & Decor.
// Sert le frontend (fichiers statiques) + expose l'API REST (/api/*) + protège /admin.

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Initialise la base de données et insère les données de démonstration si nécessaire
require('./database/db');
require('./database/seed')();

const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Nécessaire derrière un proxy HTTPS (Render, Railway, Heroku, nginx...) : sans ce
// réglage, Express ne reconnaît pas que la connexion entrante est bien en HTTPS et
// les cookies de session "secure" (voir plus bas) ne fonctionnent pas correctement,
// ce qui empêche la connexion à l'administration une fois le site en ligne.
if (isProd) app.set('trust proxy', 1);

// --- Sécurité générale ---
app.use(helmet({
  contentSecurityPolicy: false, // désactivé pour simplifier le développement local avec CDN (Font Awesome, Google Fonts, AOS)
}));
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Limite globale anti-abus sur l'API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Parsing des requêtes ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session (utilisée uniquement pour l'authentification admin) ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // cookie sécurisé (HTTPS) uniquement en production
    maxAge: 1000 * 60 * 60 * 8, // 8 heures
  },
}));

// --- Fichiers statiques ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ============================================================
// API PUBLIQUE
// ============================================================
app.use('/api/config', require('./routes/config'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/realisations', require('./routes/realisations'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/quote', require('./routes/quote'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// ============================================================
// API ADMINISTRATION
// ============================================================
app.use('/api/admin', require('./routes/adminAuth')); // login / logout / me (non protégé)
app.use('/api/admin', requireAuth, require('./routes/admin')); // tout le reste, protégé

// ============================================================
// PAGES FRONTEND (fichiers HTML statiques dans /views)
// ============================================================
const views = path.join(__dirname, 'views');
app.get('/', (req, res) => res.sendFile(path.join(views, 'index.html')));
app.get('/a-propos', (req, res) => res.sendFile(path.join(views, 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(views, 'services.html')));
app.get('/galerie', (req, res) => res.sendFile(path.join(views, 'gallery.html')));
app.get('/realisations', (req, res) => res.sendFile(path.join(views, 'realisations.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(views, 'contact.html')));
app.get('/devis', (req, res) => res.sendFile(path.join(views, 'quote.html')));
app.get('/boutique', (req, res) => res.sendFile(path.join(views, 'shop.html')));
app.get('/boutique/commande', (req, res) => res.sendFile(path.join(views, 'checkout.html')));

// ============================================================
// PAGES ADMINISTRATION (protection faite côté client via /api/admin/me,
// les données sensibles elles-mêmes restent protégées côté serveur par requireAuth)
// ============================================================
const admin = path.join(__dirname, 'admin');
app.get('/admin', (req, res) => res.sendFile(path.join(admin, 'login.html')));
app.get('/admin/', (req, res) => res.sendFile(path.join(admin, 'login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(admin, 'dashboard.html')));
app.get('/admin/gallery', (req, res) => res.sendFile(path.join(admin, 'gallery.html')));
app.get('/admin/realisations', (req, res) => res.sendFile(path.join(admin, 'realisations.html')));
app.get('/admin/messages', (req, res) => res.sendFile(path.join(admin, 'messages.html')));
app.get('/admin/quotes', (req, res) => res.sendFile(path.join(admin, 'quotes.html')));
app.get('/admin/products', (req, res) => res.sendFile(path.join(admin, 'products.html')));
app.get('/admin/orders', (req, res) => res.sendFile(path.join(admin, 'orders.html')));
app.get('/admin/settings', (req, res) => res.sendFile(path.join(admin, 'settings.html')));

// --- 404 ---
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ressource introuvable.' });
  }
  res.status(404).sendFile(path.join(views, '404.html'));
});

// --- Gestionnaire d'erreurs global ---
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ error: 'Une erreur serveur est survenue.' });
  }
  res.status(500).send('Une erreur serveur est survenue.');
});

app.listen(PORT, () => {
  console.log('');
  console.log('  🌸  Nel\'s Store & Decor — serveur démarré');
  console.log(`  ➜  http://localhost:${PORT}`);
  console.log(`  ➜  Administration : http://localhost:${PORT}/admin`);
  console.log('');
});
