/* public/js/admin-orders.js — Suivi des commandes passées via la boutique */

const ORDER_STATUSES = ['nouvelle', 'confirmée', 'en préparation', 'livrée', 'annulée'];

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;
  await loadOrders();
});

function formatPriceHTG(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} HTG`;
}

function formatDateTime(str) {
  try {
    const d = new Date(str.replace(' ', 'T') + 'Z');
    return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return str; }
}

function statusBadgeClass(status) {
  const map = {
    'nouvelle': 'badge-rose',
    'confirmée': 'badge-navy',
    'en préparation': 'badge-gold',
    'livrée': 'badge-green',
    'annulée': 'badge-rose',
  };
  return map[status] || 'badge-navy';
}

async function loadOrders() {
  const wrap = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  wrap.innerHTML = '<div class="spinner"></div>';
  try {
    const orders = await adminFetchJSON('/api/admin/orders');
    if (!orders.length) {
      wrap.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    wrap.innerHTML = orders.map(o => `
      <div class="order-card" data-id="${o.id}">
        <div class="order-card-head">
          <div>
            <h3>Commande #${o.id} — ${escapeHTML(o.full_name)}</h3>
            <div class="order-meta">${formatDateTime(o.created_at)}</div>
          </div>
          <span class="badge ${statusBadgeClass(o.status)}">${escapeHTML(o.status)}</span>
        </div>

        <div class="order-card-items">
          ${o.items.map(it => `
            <div class="order-item-row">
              <span>${escapeHTML(it.product_name)} <span class="qty">× ${it.quantity}</span></span>
              <span>${formatPriceHTG(it.unit_price * it.quantity)}</span>
            </div>
          `).join('')}
          <div class="order-total-row">
            <span>Total</span>
            <span>${formatPriceHTG(o.total)}</span>
          </div>
        </div>

        <div class="order-contact-info">
          <div><strong>Téléphone :</strong> ${escapeHTML(o.phone)}</div>
          ${o.email ? `<div><strong>Email :</strong> ${escapeHTML(o.email)}</div>` : ''}
          <div><strong>Adresse :</strong> ${escapeHTML(o.address)}</div>
          ${o.delivery_date ? `<div><strong>Date souhaitée :</strong> ${escapeHTML(o.delivery_date)}</div>` : ''}
          ${o.notes ? `<div><strong>Remarques :</strong> ${escapeHTML(o.notes)}</div>` : ''}
        </div>

        <div class="order-card-footer">
          <select class="status-select" data-id="${o.id}" style="padding:8px 14px;border-radius:8px;border:1px solid rgba(27,42,74,0.15);font-size:0.85rem;">
            ${ORDER_STATUSES.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <button class="icon-btn danger delete-btn" title="Supprimer" data-id="${o.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');

    wrap.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', () => updateOrderStatus(sel.dataset.id, sel.value)));
    wrap.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteOrder(btn.dataset.id)));
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

async function updateOrderStatus(id, status) {
  try {
    await adminFetchJSON(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    showToast('Statut mis à jour.');
    await loadOrders();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteOrder(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return;
  try {
    await adminFetchJSON(`/api/admin/orders/${id}`, { method: 'DELETE' });
    showToast('Commande supprimée.');
    await loadOrders();
  } catch (err) { showToast(err.message, 'error'); }
}
