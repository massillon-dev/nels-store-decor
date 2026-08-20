/* public/js/admin-login.js — Gère le formulaire de connexion de l'administration */

document.addEventListener('DOMContentLoaded', async () => {
  // Si déjà connecté, redirige directement vers le dashboard
  try {
    const res = await fetch('/api/admin/me');
    const data = await res.json();
    if (data.authenticated) {
      window.location.href = '/admin/dashboard';
      return;
    }
  } catch (e) { /* continue vers le formulaire */ }

  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Connexion...';
    alertBox.className = 'form-alert';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.value, password: form.password.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects.');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      alertBox.textContent = err.message;
      alertBox.className = 'form-alert show error';
      btn.disabled = false;
      btn.innerHTML = 'Se connecter <i class="fa-solid fa-arrow-right"></i>';
    }
  });
});
