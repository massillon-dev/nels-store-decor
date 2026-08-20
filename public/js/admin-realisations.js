/* public/js/admin-realisations.js — Ajout / modification / suppression des réalisations (projets) */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;

  await loadRealisations();
  setupAddForm();
  setupEditModal();
});

async function loadRealisations() {
  const wrap = document.getElementById('adminRealisationsGrid');
  wrap.innerHTML = '<div class="spinner"></div>';
  try {
    const items = await adminFetchJSON('/api/admin/realisations');
    if (!items.length) {
      wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>Aucune réalisation pour le moment.</p></div>';
      return;
    }
    wrap.innerHTML = items.map(r => `
      <div class="admin-gallery-item" data-id="${r.id}">
        ${renderMediaThumb(r.cover_image, r.cover_media_type, r.title)}
        <div class="admin-gallery-item-body">
          <h4>${escapeHTML(r.title)}</h4>
          <span>${escapeHTML(r.event_type || '')}</span>
        </div>
        <div class="admin-gallery-item-actions">
          <button class="icon-btn edit-btn" title="Modifier" data-id="${r.id}" data-title="${escapeHTML(r.title)}" data-event_type="${escapeHTML(r.event_type || '')}" data-event_date="${escapeHTML(r.event_date || '')}" data-location="${escapeHTML(r.location || '')}" data-description="${escapeHTML(r.description || '')}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');
    wrap.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset)));
    wrap.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteRealisation(btn.dataset.id)));
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function setupAddForm() {
  const form = document.getElementById('addRealisationForm');
  const filesInput = document.getElementById('realisationPhotos');
  const fileNameEl = document.getElementById('realisationFileName');

  filesInput.addEventListener('change', () => {
    fileNameEl.textContent = filesInput.files.length ? `${filesInput.files.length} photo(s) sélectionnée(s)` : 'Aucun fichier sélectionné';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Ajout en cours...';

    const formData = new FormData(form);
    try {
      await adminFetchJSON('/api/admin/realisations', { method: 'POST', body: formData });
      showToast('Réalisation ajoutée avec succès.');
      form.reset();
      fileNameEl.textContent = 'Aucun fichier sélectionné';
      await loadRealisations();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Publier la réalisation <i class="fa-solid fa-plus"></i>';
    }
  });
}

function openEditModal(dataset) {
  const modal = document.getElementById('editRealisationModal');
  document.getElementById('editRealisationId').value = dataset.id;
  document.getElementById('editRealisationTitle').value = dataset.title || '';
  document.getElementById('editRealisationEventType').value = dataset.event_type || '';
  document.getElementById('editRealisationDate').value = dataset.event_date || '';
  document.getElementById('editRealisationLocation').value = dataset.location || '';
  document.getElementById('editRealisationDescription').value = dataset.description || '';

  const newPhotosInput = document.getElementById('editRealisationNewPhotos');
  const newPhotosNameEl = document.getElementById('editRealisationNewPhotosName');
  newPhotosInput.value = '';
  newPhotosNameEl.textContent = 'Aucun fichier sélectionné';

  const currentPhotosWrap = document.getElementById('editRealisationCurrentPhotos');
  currentPhotosWrap.innerHTML = '<div class="spinner" style="margin:10px auto;"></div>';
  modal.classList.add('open');

  // Charge la liste complète des photos de cette réalisation (le bouton "modifier"
  // n'a que les infos texte en data-*, pas les photos).
  adminFetchJSON(`/api/admin/realisations/${dataset.id}`)
    .then(full => {
      renderCurrentPhotos(full.photos || []);
    })
    .catch(err => {
      currentPhotosWrap.innerHTML = `<p style="font-size:0.82rem;color:var(--ink-soft);">${err.message}</p>`;
    });
}

function renderCurrentPhotos(photos) {
  const wrap = document.getElementById('editRealisationCurrentPhotos');
  if (!photos.length) {
    wrap.innerHTML = '<p style="font-size:0.82rem;color:var(--ink-soft);">Aucune photo actuellement. Ajoutez-en une ci-dessous.</p>';
    return;
  }
  wrap.innerHTML = photos.map(p => `
    <div class="removable-photo" data-path="${p.image_path}" title="Cliquer pour retirer / conserver">
      ${p.media_type === 'video'
        ? `<video src="${p.image_path}" muted preload="metadata"></video>`
        : `<img src="${p.image_path}" alt="Photo de la réalisation">`}
      <div class="remove-overlay"><i class="fa-solid fa-trash"></i></div>
    </div>
  `).join('');

  wrap.querySelectorAll('.removable-photo').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('marked-for-removal'));
  });
}

function setupEditModal() {
  const modal = document.getElementById('editRealisationModal');
  const form = document.getElementById('editRealisationForm');
  const newPhotosInput = document.getElementById('editRealisationNewPhotos');
  const newPhotosNameEl = document.getElementById('editRealisationNewPhotosName');

  newPhotosInput.addEventListener('change', () => {
    newPhotosNameEl.textContent = newPhotosInput.files.length ? `${newPhotosInput.files.length} nouvelle(s) photo(s) sélectionnée(s)` : 'Aucun fichier sélectionné';
  });

  document.getElementById('closeEditRealisationModal').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('cancelEditRealisationModal').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editRealisationId').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enregistrement...';

    // Photos existantes à conserver = celles PAS marquées pour suppression
    const keepPaths = Array.from(document.querySelectorAll('#editRealisationCurrentPhotos .removable-photo:not(.marked-for-removal)'))
      .map(el => el.dataset.path);

    const formData = new FormData();
    formData.append('title', document.getElementById('editRealisationTitle').value);
    formData.append('event_type', document.getElementById('editRealisationEventType').value);
    formData.append('event_date', document.getElementById('editRealisationDate').value);
    formData.append('location', document.getElementById('editRealisationLocation').value);
    formData.append('description', document.getElementById('editRealisationDescription').value);
    formData.append('existing_photos', JSON.stringify(keepPaths));
    Array.from(newPhotosInput.files).forEach(file => formData.append('photos', file));

    try {
      await adminFetchJSON(`/api/admin/realisations/${id}`, { method: 'PUT', body: formData });
      showToast('Réalisation mise à jour avec succès.');
      modal.classList.remove('open');
      await loadRealisations();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enregistrer';
    }
  });
}

async function deleteRealisation(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette réalisation ?')) return;
  try {
    await adminFetchJSON(`/api/admin/realisations/${id}`, { method: 'DELETE' });
    showToast('Réalisation supprimée.');
    await loadRealisations();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
