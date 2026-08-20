/* public/js/admin-messages.js — Liste des messages reçus via le formulaire de contact */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;
  await loadMessages();
});

async function loadMessages() {
  const tbody = document.getElementById('messagesTableBody');
  const empty = document.getElementById('messagesEmpty');
  try {
    const items = await adminFetchJSON('/api/admin/messages');
    if (!items.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = items.map(m => `
      <tr>
        <td>${m.is_read ? '<span class="badge badge-navy">Lu</span>' : '<span class="badge badge-rose">Nouveau</span>'}</td>
        <td><strong>${escapeHTML(m.full_name)}</strong></td>
        <td>${escapeHTML(m.phone)}<br><span style="color:var(--ink-soft); font-size:0.78rem;">${escapeHTML(m.email)}</span></td>
        <td>${escapeHTML(m.subject)}</td>
        <td style="max-width:280px;">${escapeHTML(m.message)}</td>
        <td>${formatDateTime(m.created_at)}</td>
        <td>
          <div class="row-actions">
            ${!m.is_read ? `<button class="icon-btn read-btn" title="Marquer comme lu" data-id="${m.id}"><i class="fa-solid fa-check"></i></button>` : ''}
            <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${m.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.read-btn').forEach(btn => btn.addEventListener('click', () => markRead(btn.dataset.id)));
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteMessage(btn.dataset.id)));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function markRead(id) {
  try {
    await adminFetchJSON(`/api/admin/messages/${id}/read`, { method: 'PUT' });
    await loadMessages();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteMessage(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
  try {
    await adminFetchJSON(`/api/admin/messages/${id}`, { method: 'DELETE' });
    showToast('Message supprimé.');
    await loadMessages();
  } catch (err) { showToast(err.message, 'error'); }
}

function formatDateTime(str) {
  try {
    const d = new Date(str.replace(' ', 'T') + 'Z');
    return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return str; }
}
