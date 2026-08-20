// middleware/upload.js
// Configuration sécurisée des uploads de fichiers (photos ET vidéos pour la galerie,
// les réalisations, la boutique, les images du site et les devis) avec multer.
//
// Sécurité appliquée :
// - types de fichiers autorisés limités à JPG / JPEG / PNG / WEBP (images)
//   et MP4 / WEBM / MOV (vidéos)
// - taille maximale différenciée : les vidéos ont une limite plus généreuse
//   que les images (configurable via .env : MAX_UPLOAD_SIZE_MB / MAX_VIDEO_SIZE_MB)
// - nom de fichier régénéré (jamais le nom d'origine envoyé par l'utilisateur)
// - extension vérifiée à la fois côté mimetype et côté nom de fichier

require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const sanitize = require('sanitize-filename');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_VIDEO_EXT = ['.mp4', '.webm', '.mov'];

const ALLOWED_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME];
const ALLOWED_EXT = [...ALLOWED_IMAGE_EXT, ...ALLOWED_VIDEO_EXT];

const maxImageBytes = Number(process.env.MAX_UPLOAD_SIZE_MB || 5) * 1024 * 1024;
const maxVideoBytes = Number(process.env.MAX_VIDEO_SIZE_MB || 50) * 1024 * 1024;

// Détermine si un fichier est une image ou une vidéo à partir de son type MIME.
// Utilisé partout dans l'administration pour savoir comment enregistrer et
// afficher chaque élément (gallery.media_type, products.media_type, etc.)
function getMediaType(mimetype) {
  return ALLOWED_VIDEO_MIME.includes(mimetype) ? 'video' : 'image';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(sanitize(file.originalname)).toLowerCase();
    const isVideo = ALLOWED_VIDEO_EXT.includes(ext);
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : (isVideo ? '.mp4' : '.jpg');
    // Nom de fichier unique et sécurisé : horodatage + octets aléatoires
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Type de fichier non autorisé. Formats acceptés : JPG, JPEG, PNG, WEBP (photos) ou MP4, WEBM, MOV (vidéos).'));
}

// La limite de taille de multer est unique par instance ; on utilise donc la
// limite vidéo (plus généreuse) au niveau de multer, puis on vérifie
// manuellement après coup qu'une image ne dépasse pas sa propre limite (plus
// stricte), pour éviter qu'une "image" de 40 Mo ne se faufile.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxVideoBytes },
});

// Middleware à utiliser APRÈS upload.single/array : vérifie que les images
// respectent bien leur limite de taille plus stricte que celle des vidéos.
function enforceImageSizeLimit(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    if (getMediaType(file.mimetype) === 'image' && file.size > maxImageBytes) {
      return res.status(400).json({
        error: `Cette image dépasse la taille maximale autorisée (${Math.round(maxImageBytes / (1024 * 1024))} Mo).`,
      });
    }
  }
  next();
}

module.exports = { upload, UPLOAD_DIR, getMediaType, enforceImageSizeLimit, maxImageBytes, maxVideoBytes };
