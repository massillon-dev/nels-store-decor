/* public/js/admin-settings.js — Téléversement des images/vidéos personnalisables du site */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;

  await loadCurrentImages();
  setupImageForms();
});

async function loadCurrentImages() {
  try {
    const images = await adminFetchJSON('/api/admin/site-images');
    applyPreview('hero', images.hero);
    applyPreview('intro', images.intro);
    applyPreview('about', images.about);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Affiche l'aperçu (photo ou vidéo) pour une clé donnée (hero/intro/about).
// Remplace la balise <img>/<video> par le bon type si besoin, comme sur le site public.
function applyPreview(key, media) {
  if (!media) return;
  const el = document.getElementById(`${key}Preview`);
  if (!el) return;

  const wantsVideo = media.media_type === 'video';
  const isCurrentlyVideo = el.tagName === 'VIDEO';

  if (wantsVideo === isCurrentlyVideo) {
    el.src = media.path;
    if (wantsVideo && el.load) el.load();
    return;
  }

  const replacement = document.createElement(wantsVideo ? 'video' : 'img');
  replacement.id = el.id;
  replacement.className = el.className;
  replacement.src = media.path;
  if (wantsVideo) {
    replacement.muted = true;
    replacement.loop = true;
    replacement.autoplay = true;
    replacement.playsInline = true;
  } else {
    replacement.alt = el.alt || '';
  }
  el.replaceWith(replacement);
}

function setupImageForms() {
  document.querySelectorAll('.site-image-form').forEach(form => {
    const key = form.dataset.key;
    const fileInput = form.querySelector('input[type="file"]');
    const fileNameEl = form.querySelector('[data-filename]');

    fileInput.addEventListener('change', () => {
      fileNameEl.textContent = fileInput.files.length ? fileInput.files[0].name : 'Aucun fichier sélectionné';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!fileInput.files.length) { showToast('Veuillez choisir une photo ou une vidéo.', 'error'); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enregistrement...';

      const formData = new FormData();
      formData.append('image', fileInput.files[0]);

      try {
        const result = await adminFetchJSON(`/api/admin/site-images/${key}`, { method: 'POST', body: formData });
        applyPreview(key, { path: `${result.image_path}?t=${Date.now()}`, media_type: result.media_type });
        showToast('Mise à jour avec succès. Déjà en ligne sur le site.');
        fileInput.value = '';
        fileNameEl.textContent = 'Aucun fichier sélectionné';
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Enregistrer cette photo <i class="fa-solid fa-check"></i>';
      }
    });
  });
}
