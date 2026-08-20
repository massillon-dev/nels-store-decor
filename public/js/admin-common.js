/* ==========================================================================
   NEL'S STORE & DECOR — JS commun à toutes les pages d'administration
   Vérifie la session, gère la sidebar mobile, la déconnexion et les toasts.
   ========================================================================== */

async function adminFetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try { data = await res.json(); } catch (e) { /* pas de JSON */ }
  if (res.status === 401) {
    window.location.href = '/admin';
    throw new Error('Session expirée.');
  }
  if (!res.ok) {
    throw new Error((data && data.error) || 'Une erreur est survenue.');
  }
  return data;
}

async function requireAdminAuth() {
  try {
    const data = await adminFetchJSON('/api/admin/me');
    if (!data.authenticated) {
      window.location.href = '/admin';
      return null;
    }
    const usernameEls = document.querySelectorAll('[data-admin-username]');
    usernameEls.forEach(el => { el.textContent = data.username; });
    return data;
  } catch (err) {
    window.location.href = '/admin';
    return null;
  }
}

function setupAdminSidebar() {
  const toggle = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  });
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.classList.remove('show'); }, 3200);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// Génère la vignette (photo ou vidéo) utilisée dans les grilles d'administration
// (Galerie, Réalisations, Produits). Une petite icône de lecture est superposée
// pour les vidéos, dont l'aperçu est basé sur la première image de la vidéo.
function renderMediaThumb(path, mediaType, altText) {
  if (mediaType === 'video') {
    return `<div style="position:relative;">
      <video src="${path}" muted preload="metadata" style="width:100%;height:140px;object-fit:cover;display:block;"></video>
      <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:rgba(16,25,47,0.6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem;pointer-events:none;"><i class="fa-solid fa-play"></i></span>
    </div>`;
  }
  return `<img src="${path}" alt="${escapeHTML(altText || '')}">`;
}

document.addEventListener('DOMContentLoaded', () => {
  setupAdminSidebar();
  setupLogout();
});
