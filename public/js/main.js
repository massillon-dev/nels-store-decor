/* ==========================================================================
   NEL'S STORE & DECOR — Logique frontend partagée
   Charge la configuration publique, gère la navbar, le bouton WhatsApp flottant,
   les animations au scroll, la galerie + lightbox, et les formulaires
   (contact / devis) via l'API REST du serveur.
   ========================================================================== */

const API = {
  config: '/api/config',
  gallery: '/api/gallery',
  categories: '/api/gallery/categories',
  realisations: '/api/realisations',
  testimonials: '/api/testimonials',
  contact: '/api/contact',
  quote: '/api/quote',
};

let SITE_CONFIG = null;

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  let data = null;
  try { data = await res.json(); } catch (e) { /* pas de contenu JSON */ }
  if (!res.ok) {
    const message = (data && (data.error || (data.details && data.details[0] && data.details[0].msg))) || 'Une erreur est survenue.';
    throw new Error(message);
  }
  return data;
}

/* ---------------------------------------------------------------------- */
/* CONFIGURATION SITE (téléphones, whatsapp, email, réseaux sociaux...)   */
/* ---------------------------------------------------------------------- */
async function loadSiteConfig() {
  try {
    SITE_CONFIG = await fetchJSON(API.config);
    applySiteConfig(SITE_CONFIG);
  } catch (err) {
    console.error('Impossible de charger la configuration du site :', err);
  }
}

function applySiteConfig(cfg) {
  // Images/vidéos personnalisables du site (héro, intro, à propos) — remplacent
  // les médias par défaut si l'administrateur en a téléversé de nouveaux.
  if (cfg.images) {
    applyHeroMedia(cfg.images.hero);
    applyMediaElement('introImg', cfg.images.intro);
    applyMediaElement('aboutImg', cfg.images.about);
  }

  // Téléphones dans le header (desktop)
  document.querySelectorAll('[data-phone-1]').forEach(el => {
    el.textContent = cfg.phone1Display;
    if (el.tagName === 'A') el.href = `tel:${cfg.phone1Tel}`;
  });
  document.querySelectorAll('[data-phone-2]').forEach(el => {
    el.textContent = cfg.phone2Display;
    if (el.tagName === 'A') el.href = `tel:${cfg.phone2Tel}`;
  });
  // Lien téléphone de la navbar (icône + numéro) : on met à jour le href et le texte
  // séparément afin de ne jamais écraser l'icône Font Awesome à l'intérieur du lien.
  document.querySelectorAll('[data-phone-1-link]').forEach(el => { el.href = `tel:${cfg.phone1Tel}`; });
  document.querySelectorAll('[data-phone-1-text]').forEach(el => { el.textContent = cfg.phone1Display; });
  document.querySelectorAll('[data-phone-2-link]').forEach(el => { el.href = `tel:${cfg.phone2Tel}`; });
  document.querySelectorAll('[data-phone-2-text]').forEach(el => { el.textContent = cfg.phone2Display; });
  document.querySelectorAll('[data-email]').forEach(el => {
    el.textContent = cfg.email;
    if (el.tagName === 'A') el.href = `mailto:${cfg.email}`;
  });
  document.querySelectorAll('[data-address]').forEach(el => { el.textContent = cfg.address; });
  document.querySelectorAll('[data-hours-weekday]').forEach(el => { el.textContent = cfg.hoursWeekday; });
  document.querySelectorAll('[data-hours-saturday]').forEach(el => { el.textContent = cfg.hoursSaturday; });
  document.querySelectorAll('[data-hours-sunday]').forEach(el => { el.textContent = cfg.hoursSunday; });

  // Réseaux sociaux
  const socialMap = { instagram: cfg.social.instagram, facebook: cfg.social.facebook, tiktok: cfg.social.tiktok, pinterest: cfg.social.pinterest };
  Object.keys(socialMap).forEach(key => {
    document.querySelectorAll(`[data-social="${key}"]`).forEach(el => {
      if (socialMap[key]) el.href = socialMap[key];
    });
  });

  setupWhatsApp(cfg);
}

// Applique une image OU une vidéo à un emplacement du site (intro, à propos...).
// Si le type change (image -> vidéo ou l'inverse) par rapport à l'élément déjà
// présent dans la page, celui-ci est remplacé par le bon type de balise.
function applyMediaElement(elementId, media) {
  const el = document.getElementById(elementId);
  if (!el || !media || !media.path) return;

  const wantsVideo = media.mediaType === 'video';
  const isCurrentlyVideo = el.tagName === 'VIDEO';

  if (wantsVideo === isCurrentlyVideo) {
    // Même type de balise : on met juste à jour la source
    if (el.getAttribute('src') !== media.path) el.src = media.path;
    return;
  }

  // Type différent : on remplace l'élément par le bon type de balise,
  // en conservant son id et ses classes (zoom, style...).
  const replacement = document.createElement(wantsVideo ? 'video' : 'img');
  replacement.id = el.id;
  replacement.className = el.className;
  replacement.src = media.path;
  if (wantsVideo) {
    replacement.autoplay = true;
    replacement.muted = true;
    replacement.loop = true;
    replacement.playsInline = true;
    replacement.setAttribute('aria-label', el.alt || '');
  } else {
    replacement.alt = el.alt || '';
    replacement.loading = 'lazy';
  }
  el.replaceWith(replacement);
}

// Applique spécifiquement le média de fond du héro de la page d'accueil, qui
// utilise une structure un peu différente (arrière-plan plein écran, avec un
// calque de dégradé par-dessus) : une <div> pour l'image, une <video> pour la
// vidéo, l'une des deux étant masquée selon le type de média actif.
function applyHeroMedia(media) {
  const heroBg = document.getElementById('heroBg');
  const heroBgVideo = document.getElementById('heroBgVideo');
  if (!heroBg || !media || !media.path) return;

  if (media.mediaType === 'video') {
    heroBg.style.display = 'none';
    if (heroBgVideo) {
      heroBgVideo.style.display = 'block';
      if (heroBgVideo.getAttribute('src') !== media.path) {
        heroBgVideo.src = media.path;
        heroBgVideo.load();
      }
      heroBgVideo.play().catch(() => { /* lecture auto bloquée par le navigateur : sans gravité */ });
    }
  } else {
    heroBg.style.display = 'block';
    heroBg.style.backgroundImage = `url('${media.path}')`;
    if (heroBgVideo) heroBgVideo.style.display = 'none';
  }
}

/* ---------------------------------------------------------------------- */
/* BOUTON WHATSAPP FLOTTANT (choix entre les deux numéros)                */
/* ---------------------------------------------------------------------- */
function setupWhatsApp(cfg) {
  const floatBtn = document.getElementById('waFloatBtn');
  const choice = document.getElementById('waChoice');
  const link1 = document.getElementById('waLink1');
  const link2 = document.getElementById('waLink2');

  if (link1 && cfg.whatsappLink1) { link1.href = cfg.whatsappLink1; link1.querySelector('.wa-number').textContent = cfg.whatsapp1; }
  if (link2 && cfg.whatsappLink2) { link2.href = cfg.whatsappLink2; link2.querySelector('.wa-number').textContent = cfg.whatsapp2; }

  // Boutons WhatsApp additionnels sur la page (footer, page contact, etc.)
  document.querySelectorAll('[data-whatsapp="1"]').forEach(el => { if (cfg.whatsappLink1) el.href = cfg.whatsappLink1; });
  document.querySelectorAll('[data-whatsapp="2"]').forEach(el => { if (cfg.whatsappLink2) el.href = cfg.whatsappLink2; });

  if (floatBtn && choice) {
    floatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      choice.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!choice.contains(e.target) && !floatBtn.contains(e.target)) {
        choice.classList.remove('open');
      }
    });
  }
}

/* ---------------------------------------------------------------------- */
/* NAVBAR : ombre au scroll + menu hamburger mobile                       */
/* ---------------------------------------------------------------------- */
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navbarMenu');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 12);
    });
  }
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      menu.classList.remove('open');
    }));
  }
}

/* ---------------------------------------------------------------------- */
/* ANIMATIONS AU SCROLL (reveal léger, sans dépendance lourde)            */
/* ---------------------------------------------------------------------- */
function setupScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------------------- */
/* GALERIE + LIGHTBOX                                                     */
/* ---------------------------------------------------------------------- */
let galleryItems = [];
let currentLightboxIndex = 0;

async function initGalleryPage() {
  const grid = document.getElementById('galleryGrid');
  const filtersWrap = document.getElementById('galleryFilters');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const [items, categories] = await Promise.all([
      fetchJSON(API.gallery),
      fetchJSON(API.categories),
    ]);
    galleryItems = items;
    renderFilters(filtersWrap, categories);
    renderGalleryGrid(grid, items);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-image"></i><p>${err.message}</p></div>`;
  }
}

function renderFilters(wrap, categories) {
  if (!wrap) return;
  const all = ['Toutes', ...categories];
  wrap.innerHTML = all.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      wrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const grid = document.getElementById('galleryGrid');
      grid.innerHTML = '<div class="spinner"></div>';
      const cat = btn.dataset.cat;
      const url = cat === 'Toutes' ? API.gallery : `${API.gallery}?category=${encodeURIComponent(cat)}`;
      const items = await fetchJSON(url);
      galleryItems = items;
      renderGalleryGrid(grid, items);
    });
  });
}

function renderGalleryGrid(grid, items) {
  if (!items.length) {
    grid.innerHTML = '<div class="gallery-empty">Aucune photo dans cette catégorie pour le moment.</div>';
    return;
  }
  grid.innerHTML = items.map((item, index) => `
    <div class="gallery-item" data-index="${index}" data-reveal>
      ${item.media_type === 'video'
        ? `<video src="${item.image_path}" muted loop playsinline preload="metadata"></video><span class="media-play-icon"><i class="fa-solid fa-play"></i></span>`
        : `<img src="${item.image_path}" alt="${escapeHTML(item.title)}" loading="lazy" />`}
      <div class="gallery-item-overlay">
        <span>${escapeHTML(item.category)}</span>
        <h4>${escapeHTML(item.title)}</h4>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(Number(el.dataset.index)));
    const video = el.querySelector('video');
    if (video) {
      el.addEventListener('mouseenter', () => video.play().catch(() => {}));
      el.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    }
  });

  setupScrollReveal();
}

function openLightbox(index) {
  currentLightboxIndex = index;
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  renderLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderLightbox() {
  const item = galleryItems[currentLightboxIndex];
  if (!item) return;

  const imgEl = document.getElementById('lightboxImg');
  const videoEl = document.getElementById('lightboxVideo');

  if (item.media_type === 'video') {
    imgEl.style.display = 'none';
    imgEl.src = '';
    if (videoEl) {
      videoEl.style.display = 'block';
      videoEl.src = item.image_path;
      videoEl.load();
      videoEl.play().catch(() => {});
    }
  } else {
    if (videoEl) { videoEl.pause(); videoEl.style.display = 'none'; videoEl.src = ''; }
    imgEl.style.display = 'block';
    imgEl.src = item.image_path;
    imgEl.alt = item.title;
  }

  document.getElementById('lightboxCategory').textContent = item.category;
  document.getElementById('lightboxTitle').textContent = item.title;
  document.getElementById('lightboxDescription').textContent = item.description || '';
}

function closeLightbox() {
  const videoEl = document.getElementById('lightboxVideo');
  if (videoEl) videoEl.pause();
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(direction) {
  currentLightboxIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
  renderLightbox();
}

function setupLightboxControls() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => lightboxNav(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => lightboxNav(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });
}

/* ---------------------------------------------------------------------- */
/* HOMEPAGE : galerie aperçu + témoignages                                */
/* ---------------------------------------------------------------------- */
async function initHomeGalleryPreview() {
  const grid = document.getElementById('homeGalleryPreview');
  if (!grid) return;
  try {
    const items = await fetchJSON(API.gallery);
    galleryItems = items.slice(0, 8);
    renderGalleryGrid(grid, galleryItems);
  } catch (err) {
    grid.innerHTML = '';
  }
}

async function initTestimonials() {
  const wrap = document.getElementById('testimonialsGrid');
  if (!wrap) return;
  try {
    const items = await fetchJSON(API.testimonials);
    if (!items.length) { wrap.closest('.section').style.display = 'none'; return; }
    wrap.innerHTML = items.map(t => `
      <div class="testimonial-card" data-reveal>
        <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <p class="quote">« ${escapeHTML(t.content)} »</p>
        <div class="testimonial-author">
          <strong>${escapeHTML(t.client_name)}</strong>
          <span>${escapeHTML(t.event_type || '')}</span>
        </div>
      </div>
    `).join('');
    setupScrollReveal();
  } catch (err) { /* silencieux */ }
}

/* ---------------------------------------------------------------------- */
/* RÉALISATIONS                                                           */
/* ---------------------------------------------------------------------- */
async function initRealisationsPage() {
  const wrap = document.getElementById('realisationsList');
  if (!wrap) return;
  wrap.innerHTML = '<div class="spinner"></div>';
  try {
    const items = await fetchJSON(API.realisations);
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>${typeof t === 'function' ? t('realisations_empty', getCurrentLang()) : 'Aucune réalisation publiée pour le moment.'}</p></div>`;
      return;
    }
    const detailed = await Promise.all(items.map(it => fetchJSON(`${API.realisations}/${it.id}`)));
    wrap.innerHTML = detailed.map(r => `
      <div class="realisation-card" data-reveal>
        <div>
          <span class="eyebrow">${escapeHTML(r.event_type || 'Réalisation')}</span>
          <h3>${escapeHTML(r.title)}</h3>
          <div class="realisation-meta">
            ${r.event_date ? `<span><i class="fa-regular fa-calendar"></i> ${formatDate(r.event_date)}</span>` : ''}
            ${r.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(r.location)}</span>` : ''}
          </div>
          <p>${escapeHTML(r.description || '')}</p>
          ${r.photos && r.photos.length ? `<div class="realisation-photos">${r.photos.map(p => p.media_type === 'video'
            ? `<span class="realisation-photo-video"><video src="${p.image_path}" muted loop playsinline preload="metadata" class="zoomable"></video><i class="fa-solid fa-play"></i></span>`
            : `<img src="${p.image_path}" alt="${escapeHTML(r.title)}" class="zoomable">`).join('')}</div>` : ''}
        </div>
        ${r.cover_media_type === 'video'
          ? `<video src="${r.cover_image}" controls muted loop playsinline></video>`
          : `<img src="${r.cover_image}" alt="${escapeHTML(r.title)}" loading="lazy" class="zoomable">`}
      </div>
    `).join('');
    setupScrollReveal();
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

/* ---------------------------------------------------------------------- */
/* FORMULAIRE DE CONTACT                                                  */
/* ---------------------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const alertBox = document.getElementById('contactAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';
    hideAlert(alertBox);

    const payload = {
      full_name: form.full_name.value,
      phone: form.phone.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
    };

    try {
      const res = await fetchJSON(API.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showAlert(alertBox, 'success', res.message);
      form.reset();
    } catch (err) {
      showAlert(alertBox, 'error', err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Envoyer le message <i class="fa-solid fa-paper-plane"></i>';
    }
  });
}

/* ---------------------------------------------------------------------- */
/* FORMULAIRE DE DEMANDE DE DEVIS                                         */
/* ---------------------------------------------------------------------- */
function setupQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  const alertBox = document.getElementById('quoteAlert');
  const fileInput = document.getElementById('inspirationImage');
  const fileNameEl = document.getElementById('inspirationFileName');

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      fileNameEl.textContent = fileInput.files.length ? fileInput.files[0].name : 'Aucun fichier sélectionné';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';
    hideAlert(alertBox);

    const formData = new FormData(form);

    try {
      const res = await fetchJSON(API.quote, { method: 'POST', body: formData });
      showAlert(alertBox, 'success', res.message);
      form.reset();
      if (fileNameEl) fileNameEl.textContent = 'Aucun fichier sélectionné';
    } catch (err) {
      showAlert(alertBox, 'error', err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Envoyer ma demande <i class="fa-solid fa-paper-plane"></i>';
    }
  });
}

/* ---------------------------------------------------------------------- */
/* UTILITAIRES                                                            */
/* ---------------------------------------------------------------------- */
function showAlert(el, type, message) {
  if (!el) return;
  el.className = `form-alert show ${type}`;
  el.textContent = message;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideAlert(el) {
  if (!el) return;
  el.className = 'form-alert';
  el.textContent = '';
}
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return dateStr; }
}

/* ---------------------------------------------------------------------- */
/* INITIALISATION GLOBALE                                                 */
/* ---------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadSiteConfig();
  setupNavbar();
  setupScrollReveal();
  setupLightboxControls();
  initGalleryPage();
  initHomeGalleryPreview();
  initTestimonials();
  initRealisationsPage();
  setupContactForm();
  setupQuoteForm();

  // Année dynamique dans le footer
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
});
