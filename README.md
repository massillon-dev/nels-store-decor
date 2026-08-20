# 🌸 Nel's Store & Decor — Site Web Officiel

Site web professionnel pour **Nel's Store & Decor**, spécialiste de l'art floral, de la
décoration et des créations événementielles.

Application full-stack réelle (pas une simple maquette) : Node.js + Express + SQLite,
avec un espace d'administration complet pour gérer la galerie photo, les réalisations,
les messages de contact et les demandes de devis — sans jamais toucher au code.

---

## 1. Installation

Prérequis : [Node.js](https://nodejs.org) version 18 ou supérieure.

Ouvrez le projet dans **Visual Studio Code**, puis dans le terminal intégré :

```bash
npm install
```

> `better-sqlite3` compile un petit module natif au moment de l'installation.
> Si l'installation échoue sur Windows, installez au préalable les
> [Build Tools for Visual Studio](https://github.com/nodejs/node-gyp#on-windows) puis relancez `npm install`.

## 2. Configuration

Copiez le fichier d'exemple vers `.env` :

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows (invite de commandes)
```

Ouvrez `.env` et personnalisez au minimum :

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Une longue chaîne aléatoire (ex : générée avec `openssl rand -hex 32`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Identifiants du compte administrateur créé au premier démarrage |
| `PHONE_NUMBER_1` / `PHONE_NUMBER_2` | Les deux numéros de téléphone de l'entreprise |
| `WHATSAPP_NUMBER_1` / `WHATSAPP_NUMBER_2` | Numéros WhatsApp (peuvent être identiques aux téléphones) |
| `WHATSAPP_COUNTRY_CODE` | Indicatif international (509 pour Haïti, déjà configuré) |
| `CONTACT_EMAIL`, `BUSINESS_ADDRESS`, horaires, réseaux sociaux | Informations affichées sur le site |

**Tout le site lit ces variables depuis `.env` via `config/site.js`.**
Si un numéro change, modifiez uniquement `.env` — aucun fichier de code à toucher.

⚠️ Ne modifiez jamais l'`ADMIN_PASSWORD` dans `.env` *après* le premier démarrage et en
espérant que ça change le mot de passe existant : le compte est créé une seule fois, à la
première exécution, quand la base est vide. Pour changer le mot de passe ensuite, supprimez
la base (`database/database.sqlite`) puis redémarrez, ou changez-le directement en base.

## 3. Démarrage

Mode développement (redémarrage automatique à chaque modification) :

```bash
npm run dev
```

Mode production :

```bash
npm start
```

Le serveur démarre sur :

```
http://localhost:3000
```

Administration :

```
http://localhost:3000/admin
```

Identifiants par défaut (définis dans `.env.example`, à changer avant mise en ligne) :

```
Utilisateur : admin
Mot de passe : NelsStore2026!
```

## 4. Structure du projet

```
nels-store-decor/
│
├── public/                  Fichiers statiques servis directement
│   ├── css/                 style.css (site) + admin.css (administration)
│   ├── js/                  main.js, partials.js, admin-*.js
│   ├── images/               Logo officiel + images de démonstration
│   │   └── logo/             logo.png + favicons générés
│   └── uploads/              Photos ajoutées via l'administration (créé au premier upload)
│
├── views/                    Pages HTML publiques
├── admin/                    Pages HTML de l'espace d'administration
│
├── routes/                   Routes Express (API REST)
│   ├── config.js             Configuration publique (téléphones, WhatsApp, etc.)
│   ├── gallery.js            Galerie (lecture publique)
│   ├── realisations.js       Réalisations (lecture publique)
│   ├── testimonials.js       Témoignages (lecture publique)
│   ├── contact.js            Réception du formulaire de contact
│   ├── quote.js               Réception des demandes de devis
│   ├── adminAuth.js          Connexion / déconnexion administrateur
│   └── admin.js              Toutes les routes protégées (CRUD galerie, etc.)
│
├── middleware/
│   ├── auth.js                Vérifie qu'un administrateur est connecté
│   └── upload.js               Upload sécurisé des images (multer)
│
├── config/
│   └── site.js                 Configuration centralisée depuis .env
│
├── database/
│   ├── db.js                   Connexion SQLite + création du schéma
│   ├── seed.js                  Données de démonstration (une seule fois)
│   └── database.sqlite         Base de données (créée automatiquement)
│
├── server.js                    Point d'entrée de l'application
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 5. Fonctionnalités

### Site public
- Page d'accueil avec héro, présentation, services, aperçu galerie, témoignages
- Pages : À propos, Services, Galerie (avec filtres par catégorie + lightbox), Réalisations, Contact, Demande de devis
- Formulaire de contact et formulaire de devis réellement fonctionnels (enregistrés en base SQLite)
- Upload d'une photo d'inspiration dans le formulaire de devis
- Bouton WhatsApp flottant sur toutes les pages, avec choix entre les deux numéros configurés
- Numéros de téléphone cliquables sur mobile (`tel:`)
- Design entièrement responsive (testé de 375px à 1920px)
- Animations discrètes au scroll et au survol

### Espace d'administration (`/admin`)
- Connexion sécurisée (mot de passe hashé avec bcrypt, sessions serveur)
- Tableau de bord avec statistiques (photos, devis, messages, projets)
- **Galerie** : ajout de photos (avec titre, catégorie, description), modification, suppression avec confirmation
- **Réalisations** : publication de projets avec plusieurs photos, date, lieu, description
- **Messages** : consultation, marquage comme lu, suppression
- **Demandes de devis** : consultation, changement de statut, suppression

## 6. Sécurité

- Mots de passe administrateur hashés avec bcrypt (jamais stockés en clair)
- Sessions serveur sécurisées (cookie `httpOnly`, `secure` en production)
- Toutes les routes d'administration protégées par middleware d'authentification
- Validation stricte des formulaires côté serveur (express-validator)
- Requêtes SQL paramétrées (better-sqlite3) — aucune injection SQL possible
- Upload de fichiers limité aux formats JPG / JPEG / PNG / WEBP, taille maximale configurable
- Noms de fichiers uploadés régénérés aléatoirement (jamais le nom d'origine)
- En-têtes de sécurité HTTP via Helmet
- Limitation du nombre de requêtes (anti-abus) sur l'API et sur la connexion admin
- Variables sensibles exclusivement dans `.env` (jamais commité, voir `.gitignore`)

## 7. Ajouter vos propres photos

1. Connectez-vous sur `/admin`
2. Rendez-vous dans **Galerie**
3. Sélectionnez une photo, indiquez un titre, une catégorie et une description
4. Cliquez sur **Ajouter à la galerie**

La photo apparaît immédiatement sur la page publique `/galerie`. Vous pouvez à tout
moment modifier son titre/catégorie/description, ou la supprimer.

## 8. Remplacer les données de démonstration

Le projet est livré avec des photos de démonstration générées (couleurs de la marque),
des réalisations d'exemple et des témoignages fictifs, afin que vous puissiez voir le
résultat immédiatement. Depuis l'administration, supprimez les éléments de démonstration
et ajoutez vos vraies photos et informations quand vous êtes prêt.

## 9. Préparation à l'hébergement

Le projet est prêt à être hébergé (Render, Railway, VPS, etc.) :

- Toutes les informations sensibles sont dans `.env` (jamais codées en dur)
- Aucun chemin de fichier absolu propre à un ordinateur
- `NODE_ENV=production` dans `.env` active les cookies sécurisés (HTTPS)
- Pour un trafic plus important, la base SQLite peut être remplacée par MySQL ou
  PostgreSQL : seul le fichier `database/db.js` (et les requêtes SQL dans `routes/`)
  aurait besoin d'être adapté, la structure du reste du projet ne change pas.

## 10. SEO

Chaque page publique possède un `title`, une `meta description` et des balises Open
Graph. Un `robots.txt` et un `sitemap.xml` sont fournis dans `public/` — pensez à
remplacer `https://www.nelsstoredecor.com` par votre nom de domaine réel une fois le
site en ligne.

## 11. Notes sur le logo et l'identité visuelle

Le logo officiel fourni (`public/images/logo/logo.png`) est utilisé tel quel, sans
modification de ses couleurs, proportions ou texte. La palette du site (bleu marine,
or, rose fuchsia) a été choisie pour s'harmoniser avec ce logo. Des favicons ont été
générés automatiquement à partir du motif de la rose du logo.

---

**Nel's Store & Decor** — Art Floral • Décoration • Créations
