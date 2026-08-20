/* public/js/admin-dashboard.js — Statistiques du tableau de bord */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = await requireAdminAuth();
  if (!auth) return;

  try {
    const stats = await adminFetchJSON('/api/admin/stats');
    document.getElementById('statPhotos').textContent = stats.photos;
    document.getElementById('statQuotes').textContent = stats.quotes;
    document.getElementById('statMessages').textContent = stats.messages;
    document.getElementById('statUnread').textContent = stats.unreadMessages;
    document.getElementById('statProjects').textContent = stats.projects;
    document.getElementById('statProducts').textContent = stats.products;
    document.getElementById('statOrders').textContent = stats.orders;
    document.getElementById('statNewOrders').textContent = stats.newOrders;
  } catch (err) {
    showToast(err.message, 'error');
  }
});
