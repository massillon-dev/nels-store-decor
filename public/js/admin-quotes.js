/* public/js/admin-quotes.js — Liste des demandes de devis reçues */

const QUOTE_STATUSES = ['nouveau', 'en cours', 'accepté', 'refusé'];

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;
  await loadQuotes();
});

async function loadQuotes() {
  const tbody = document.getElementById('quotesTableBody');
  const empty = document.getElementById('quotesEmpty');
  try {
    const items = await adminFetchJSON('/api/admin/quotes');
    if (!items.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = items.map(q => `
      <tr>
        <td><strong>${escapeHTML(q.full_name)}</strong><br><span style="font-size:0.78rem;color:var(--ink-soft);">${escapeHTML(q.phone)}</span></td>
        <td>${escapeHTML(q.service_type)}</td>
        <td>${q.event_date ? escapeHTML(q.event_date) : '—'}</td>
        <td>${q.location ? escapeHTML(q.location) : '—'}</td>
        <td>${q.budget ? escapeHTML(q.budget) : '—'}</td>
        <td>${q.inspiration_image ? `<img src="${q.inspiration_image}" class="table-thumb" alt="Inspiration">` : '—'}</td>
        <td>
          <select class="status-select" data-id="${q.id}" style="padding:6px 10px;border-radius:8px;border:1px solid rgba(27,42,74,0.15);font-size:0.82rem;">
            ${QUOTE_STATUSES.map(s => `<option value="${s}" ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${q.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', () => updateStatus(sel.dataset.id, sel.value)));
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteQuote(btn.dataset.id)));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateStatus(id, status) {
  try {
    await adminFetchJSON(`/api/admin/quotes/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    showToast('Statut mis à jour.');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteQuote(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette demande de devis ?')) return;
  try {
    await adminFetchJSON(`/api/admin/quotes/${id}`, { method: 'DELETE' });
    showToast('Demande supprimée.');
    await loadQuotes();
  } catch (err) { showToast(err.message, 'error'); }
}
