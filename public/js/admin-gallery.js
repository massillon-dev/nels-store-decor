/* public/js/admin-gallery.js — Ajout / modification / suppression des photos de la galerie */

const CATEGORY_OPTIONS = ['Bouquets', 'Mariages', 'Événements', 'Décoration', 'Compositions florales'];

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;

  populateCategorySelects();
  await loadGallery();
  setupAddForm();
  setupEditModal();
});

function populateCategorySelects() {
  document.querySelectorAll('.category-select').forEach(select => {
    select.innerHTML = CATEGORY_OPTIONS.map(c => `<option value="${c}">${c}</option>`).join('');
  });
}

async function loadGallery() {
  const grid = document.getElementById('adminGalleryGrid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const items = await adminFetchJSON('/api/admin/gallery');
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-image"></i><p>Aucune photo pour le moment. Ajoutez votre première photo ci-dessus.</p></div>';
      return;
    }
    grid.innerHTML = items.map(item => `
      <div class="admin-gallery-item" data-id="${item.id}">
        ${renderMediaThumb(item.image_path, item.media_type, item.title)}
        <div class="admin-gallery-item-body">
          <h4>${escapeHTML(item.title)}</h4>
          <span>${escapeHTML(item.category)}</span>
        </div>
        <div class="admin-gallery-item-actions">
          <button class="icon-btn edit-btn" title="Modifier" data-id="${item.id}" data-title="${escapeHTML(item.title)}" data-category="${escapeHTML(item.category)}" data-description="${escapeHTML(item.description || '')}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset)));
    grid.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deletePhoto(btn.dataset.id)));
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function setupAddForm() {
  const form = document.getElementById('addPhotoForm');
  const fileInput = document.getElementById('photoFile');
  const fileNameEl = document.getElementById('photoFileName');

  fileInput.addEventListener('change', () => {
    fileNameEl.textContent = fileInput.files.length ? fileInput.files[0].name : 'Aucun fichier sélectionné';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (!fileInput.files.length) { showToast('Veuillez sélectionner une photo.', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Ajout en cours...';

    const formData = new FormData(form);
    try {
      await adminFetchJSON('/api/admin/gallery', { method: 'POST', body: formData });
      showToast('Photo ajoutée à la galerie avec succès.');
      form.reset();
      fileNameEl.textContent = 'Aucun fichier sélectionné';
      await loadGallery();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Ajouter à la galerie <i class="fa-solid fa-plus"></i>';
    }
  });
}

function openEditModal(dataset) {
  const modal = document.getElementById('editModal');
  document.getElementById('editId').value = dataset.id;
  document.getElementById('editTitle').value = dataset.title;
  document.getElementById('editCategory').value = dataset.category;
  document.getElementById('editDescription').value = dataset.description;
  document.getElementById('editFile').value = '';
  document.getElementById('editFileName').textContent = 'Fichier actuel conservé';
  modal.classList.add('open');
}

function setupEditModal() {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editForm');
  const fileInput = document.getElementById('editFile');
  const fileNameEl = document.getElementById('editFileName');

  fileInput.addEventListener('change', () => {
    fileNameEl.textContent = fileInput.files.length ? fileInput.files[0].name : 'Fichier actuel conservé';
  });

  document.getElementById('closeEditModal').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('cancelEditModal').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;

    const formData = new FormData();
    formData.append('title', document.getElementById('editTitle').value);
    formData.append('category', document.getElementById('editCategory').value);
    formData.append('description', document.getElementById('editDescription').value);
    if (fileInput.files.length) formData.append('image', fileInput.files[0]);

    try {
      await adminFetchJSON(`/api/admin/gallery/${id}`, { method: 'PUT', body: formData });
      showToast('Photo mise à jour avec succès.');
      modal.classList.remove('open');
      await loadGallery();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function deletePhoto(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return;
  try {
    await adminFetchJSON(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    showToast('Photo supprimée.');
    await loadGallery();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
