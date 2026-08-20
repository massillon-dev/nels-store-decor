// middleware/auth.js
// Protège les routes d'administration : seul un administrateur connecté
// (session valide) peut accéder aux endpoints /api/admin/* (hors /login).

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: 'Non autorisé. Veuillez vous connecter.' });
}

module.exports = { requireAuth };
