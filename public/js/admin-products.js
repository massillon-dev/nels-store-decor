/* public/js/admin-products.js — Ajout / modification / suppression des produits de la boutique */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;

  await loadProducts();
  setupAddForm();
  setupEditModal();
});

function formatPriceHTG(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} HTG`;
}

async function loadProducts() {
  const grid = document.getElementById('adminProductsGrid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const items = await adminFetchJSON('/api/admin/products');
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-basket-shopping"></i><p>Aucun produit pour le moment. Ajoutez votre premier produit ci-dessus.</p></div>';
      return;
    }
    grid.innerHTML = items.map(p => `
      <div class="admin-gallery-item" data-id="${p.id}">
        ${renderMediaThumb(p.image_path, p.media_type, p.name)}
        <div class="admin-gallery-item-body">
          <h4>${escapeHTML(p.name)} ${!p.in_stock ? '<span class="badge badge-rose" style="margin-left:6px;">Rupture</span>' : ''}</h4>
          <span>${escapeHTML(p.category)} · ${formatPriceHTG(p.price)}</span>
        </div>
        <div class="admin-gallery-item-actions">
          <button class="icon-btn edit-btn" title="Modifier" data-id="${p.id}" data-name="${escapeHTML(p.name)}" data-category="${escapeHTML(p.category)}" data-price="${p.price}" data-instock="${p.in_stock}" data-description="${escapeHTML(p.description || '')}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset)));
    grid.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function setupAddForm() {
  const form = document.getElementById('addProductForm');
  const fileInput = document.getElementById('productFile');
  const fileNameEl = document.getElementById('productFileName');

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
      await adminFetchJSON('/api/admin/products', { method: 'POST', body: formData });
      showToast('Produit ajouté avec succès.');
      form.reset();
      fileNameEl.textContent = 'Aucun fichier sélectionné';
      await loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Ajouter le produit <i class="fa-solid fa-plus"></i>';
    }
  });
}

function openEditModal(dataset) {
  const modal = document.getElementById('editProductModal');
  document.getElementById('editProductId').value = dataset.id;
  document.getElementById('editProductName').value = dataset.name || '';
  document.getElementById('editProductCategory').value = dataset.category || '';
  document.getElementById('editProductPrice').value = dataset.price || '';
  document.getElementById('editProductStock').value = dataset.instock === '1' ? 'true' : 'false';
  document.getElementById('editProductDescription').value = dataset.description || '';
  document.getElementById('editProductFile').value = '';
  document.getElementById('editProductFileName').textContent = 'Photo actuelle conservée';
  modal.classList.add('open');
}

function setupEditModal() {
  const modal = document.getElementById('editProductModal');
  const form = document.getElementById('editProductForm');
  const fileInput = document.getElementById('editProductFile');
  const fileNameEl = document.getElementById('editProductFileName');

  fileInput.addEventListener('change', () => {
    fileNameEl.textContent = fileInput.files.length ? fileInput.files[0].name : 'Photo actuelle conservée';
  });

  document.getElementById('closeEditProductModal').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('cancelEditProductModal').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;

    const formData = new FormData();
    formData.append('name', document.getElementById('editProductName').value);
    formData.append('category', document.getElementById('editProductCategory').value);
    formData.append('price', document.getElementById('editProductPrice').value);
    formData.append('in_stock', document.getElementById('editProductStock').value);
    formData.append('description', document.getElementById('editProductDescription').value);
    if (fileInput.files.length) formData.append('image', fileInput.files[0]);

    try {
      await adminFetchJSON(`/api/admin/products/${id}`, { method: 'PUT', body: formData });
      showToast('Produit mis à jour avec succès.');
      modal.classList.remove('open');
      await loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function deleteProduct(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
  try {
    await adminFetchJSON(`/api/admin/products/${id}`, { method: 'DELETE' });
    showToast('Produit supprimé.');
    await loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
