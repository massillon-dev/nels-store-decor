/* ==========================================================================
   NEL'S STORE & DECOR — Injecte les blocs HTML communs à toutes les pages :
   footer, bouton WhatsApp flottant, et lightbox de la galerie.
   Ceci évite de dupliquer ce HTML dans chaque fichier de /views et /admin.
   ========================================================================== */

const LANG_TOGGLE_HTML = `<button class="lang-toggle-btn" title="Chanje an kreyòl">HT</button>`;

const TOP_TICKER_HTML = `
<div class="top-ticker" id="topTicker">
  <div class="top-ticker-track" id="topTickerTrack"></div>
</div>
`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="/images/logo/logo.png" alt="Nel's Store & Decor" class="zoomable">
          <strong>Nel's Store &amp; Decor</strong>
        </div>
        <p data-i18n="footer_desc">Art floral &amp; décoration. Nous transformons les fleurs, les couleurs et les espaces en expériences uniques et mémorables.</p>
        <div class="social-row">
          <a data-social="instagram" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>
          <a data-social="facebook" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i></a>
          <a data-social="tiktok" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-tiktok"></i></a>
          <a data-social="pinterest" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-pinterest-p"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h5 data-i18n="footer_nav">Navigation</h5>
        <a href="/" data-i18n="nav_home">Accueil</a>
        <a href="/a-propos" data-i18n="nav_about">À propos</a>
        <a href="/services" data-i18n="nav_services">Services</a>
        <a href="/boutique" data-i18n="nav_shop">Boutique</a>
        <a href="/galerie" data-i18n="nav_gallery">Galerie</a>
        <a href="/contact" data-i18n="nav_contact">Contact</a>
      </div>
      <div class="footer-col">
        <h5 data-i18n="footer_contact">Contact</h5>
        <a data-phone-1 href="tel:"></a>
        <a data-phone-2 href="tel:"></a>
        <a data-email href="mailto:"></a>
        <p data-address></p>
      </div>
      <div class="footer-col">
        <h5 data-i18n="footer_need_info">Besoin d'informations ?</h5>
        <p style="margin-bottom:16px;" data-i18n="footer_contact_whatsapp_text">Contactez-nous directement sur WhatsApp, nous répondons rapidement.</p>
        <a data-whatsapp="1" href="#" target="_blank" rel="noopener" class="btn btn-gold btn-sm" style="margin-bottom:10px;"><i class="fa-brands fa-whatsapp"></i> WhatsApp 1</a><br>
        <a data-whatsapp="2" href="#" target="_blank" rel="noopener" class="btn btn-gold btn-sm"><i class="fa-brands fa-whatsapp"></i> WhatsApp 2</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year></span> Nel's Store &amp; Decor. <span data-i18n="footer_rights">Tous droits réservés.</span></span>
      <span data-i18n="footer_tagline">Art floral &amp; décoration</span>
    </div>
  </div>
</footer>
`;

const WHATSAPP_HTML = `
<div class="wa-float">
  <div class="wa-choice" id="waChoice">
    <h5 data-i18n="wa_contact_title">Contactez-nous sur WhatsApp</h5>
    <a href="#" id="waLink1" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp — <span class="wa-number"></span></a>
    <a href="#" id="waLink2" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp — <span class="wa-number"></span></a>
  </div>
  <button class="wa-float-btn" id="waFloatBtn"><i class="fa-brands fa-whatsapp"></i> <span data-i18n="btn_whatsapp">WhatsApp</span></button>
</div>
`;

const LIGHTBOX_HTML = `
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" id="lightboxClose"><i class="fa-solid fa-xmark"></i></button>
  <button class="lightbox-nav lightbox-prev" id="lightboxPrev"><i class="fa-solid fa-chevron-left"></i></button>
  <button class="lightbox-nav lightbox-next" id="lightboxNext"><i class="fa-solid fa-chevron-right"></i></button>
  <div class="lightbox-inner">
    <div class="lightbox-img-wrap">
      <img id="lightboxImg" src="" alt="">
      <video id="lightboxVideo" src="" controls playsinline style="display:none; max-height:88vh; width:100%;"></video>
    </div>
    <div class="lightbox-info">
      <span class="cat" id="lightboxCategory"></span>
      <h3 id="lightboxTitle"></h3>
      <p id="lightboxDescription"></p>
    </div>
  </div>
</div>
`;

// Zoom générique : s'applique à toute image OU vidéo portant la classe "zoomable"
// (logo, images de présentation, photos/vidéos de réalisations, produits de la
// boutique...). Distinct de la lightbox de la galerie (qui affiche en plus
// titre/catégorie/description).
const IMAGE_ZOOM_HTML = `
<div class="image-zoom-overlay" id="imageZoomOverlay">
  <button class="image-zoom-close" id="imageZoomClose"><i class="fa-solid fa-xmark"></i></button>
  <img id="imageZoomImg" src="" alt="">
  <video id="imageZoomVideo" src="" controls playsinline style="display:none;"></video>
</div>
`;

// Panier flottant + tiroir : présents sur TOUTES les pages du site afin que le
// panier reste accessible et cohérent, même si le client navigue entre la
// boutique et d'autres pages avant de finaliser sa commande.
const CART_FLOAT_HTML = `
<button class="cart-float-btn" id="cartFloatBtn" title="Voir le panier">
  <i class="fa-solid fa-basket-shopping"></i>
  <span class="cart-badge" id="cartBadge" style="display:none;">0</span>
</button>
`;

const CART_DRAWER_HTML = `
<div class="cart-drawer-overlay" id="cartDrawerOverlay"></div>
<div class="cart-drawer" id="cartDrawer">
  <div class="cart-drawer-head">
    <h3>Votre panier</h3>
    <button class="cart-drawer-close" id="cartDrawerClose"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <div class="cart-drawer-items" id="cartDrawerItems"></div>
  <div class="cart-drawer-footer" id="cartDrawerFooter" style="display:none;">
    <div class="cart-total-row">
      <span>Total</span>
      <strong id="cartTotalValue">0 HTG</strong>
    </div>
    <button class="btn btn-primary btn-block" id="cartCheckoutBtn">Passer la commande <i class="fa-solid fa-arrow-right"></i></button>
  </div>
</div>
`;

// Bandeau de défilement automatique (mélange galerie + boutique), inséré juste
// avant le pied de page sur toutes les pages publiques du site, pour donner
// un aperçu vivant et attractif des créations dès qu'on arrive sur le site.
const SHOWCASE_HTML = `
<section class="showcase-strip" id="showcaseStrip">
  <div class="showcase-strip-head">
    <span class="eyebrow" data-i18n="showcase_eyebrow">Nos créations</span>
    <h2 data-i18n="showcase_title">Un aperçu de notre univers floral</h2>
  </div>
  <div class="showcase-track-wrap">
    <div class="showcase-track" id="showcaseTrack"></div>
  </div>
</section>
`;

async function initShowcaseCarousel() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return;

  try {
    const gallery = await fetch('/api/gallery').then(r => r.json()).catch(() => []);

    // On ne garde que les photos de la galerie (pas les vidéos, trop lourdes/
    // instables à faire défiler rapidement en boucle).
    const items = gallery.filter(g => g.media_type !== 'video').map(g => ({ image: g.image_path, label: g.title }));
    if (!items.length) { document.getElementById('showcaseStrip').style.display = 'none'; return; }

    // Mélange aléatoire simple (Fisher-Yates)
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    const selected = items.slice(0, 14);
    // On duplique la liste pour créer une boucle infinie sans coupure visible
    const doubled = [...selected, ...selected];

    track.innerHTML = doubled.map(it => `
      <div class="showcase-item">
        <img src="${it.image}" alt="${(it.label || '').replace(/"/g, '&quot;')}" loading="lazy">
      </div>
    `).join('');

    // Vitesse proportionnelle au nombre d'éléments pour un défilement régulier
    track.style.animationDuration = `${selected.length * 4}s`;
  } catch (err) {
    const strip = document.getElementById('showcaseStrip');
    if (strip) strip.style.display = 'none';
  }
}

async function initTopTicker() {
  const track = document.getElementById('topTickerTrack');
  if (!track) return;

  let name = "Nel's Store & Decor";
  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    if (cfg && cfg.businessName) name = cfg.businessName;
  } catch (e) { /* on garde le nom par défaut si la configuration ne charge pas */ }

  const item = `<span class="top-ticker-item">${name} <i class="fa-solid fa-gem"></i></span>`;
  // Suffisamment de répétitions pour couvrir les très grands écrans sans coupure
  track.innerHTML = item.repeat(12);
}

document.addEventListener('DOMContentLoaded', () => {
  // Bouton de bascule de langue (FR/HT), ajouté dans les actions de la navbar
  // sur chaque page publique.
  const navActions = document.querySelector('.navbar-actions');
  if (navActions && !navActions.querySelector('.lang-toggle-btn')) {
    navActions.insertAdjacentHTML('afterbegin', LANG_TOGGLE_HTML);
  }

  // Bandeau défilant avec le nom de l'entreprise, tout en haut de chaque page
  // publique (au-dessus du logo et du menu).
  if (document.querySelector('.navbar') && !document.getElementById('topTicker')) {
    document.body.insertAdjacentHTML('afterbegin', TOP_TICKER_HTML);
    initTopTicker();
  }

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.outerHTML = FOOTER_HTML;

  // Le bandeau de défilement se place uniquement sur la page d'accueil, juste
  // après le grand visuel du héro.
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.insertAdjacentHTML('afterend', SHOWCASE_HTML);
    initShowcaseCarousel();
  }

  const waPlaceholder = document.getElementById('whatsapp-placeholder');
  if (waPlaceholder) waPlaceholder.outerHTML = WHATSAPP_HTML;

  const lightboxPlaceholder = document.getElementById('lightbox-placeholder');
  if (lightboxPlaceholder) lightboxPlaceholder.outerHTML = LIGHTBOX_HTML;

  // Le zoom générique et le panier sont injectés sur TOUTES les pages du site
  // (pas besoin d'ajouter de placeholder dans chaque fichier HTML).
  if (!document.getElementById('imageZoomOverlay')) {
    document.body.insertAdjacentHTML('beforeend', IMAGE_ZOOM_HTML);
  }
  if (!document.getElementById('cartFloatBtn')) {
    document.body.insertAdjacentHTML('beforeend', CART_FLOAT_HTML + CART_DRAWER_HTML);
  }
  setupImageZoom();
});

// Ouvre/ferme le zoom générique et attache le clic à toute image ou vidéo
// ".zoomable" présente sur la page. Utilise la délégation d'événements :
// fonctionne aussi pour les éléments ajoutés dynamiquement (galerie,
// réalisations, boutique...) sans avoir besoin de ré-attacher les écouteurs
// à chaque mise à jour du DOM.
function setupImageZoom() {
  const overlay = document.getElementById('imageZoomOverlay');
  const img = document.getElementById('imageZoomImg');
  const video = document.getElementById('imageZoomVideo');
  const closeBtn = document.getElementById('imageZoomClose');
  if (!overlay || !img || !video || !closeBtn) return;

  function openZoom(target) {
    const isVideo = target.tagName === 'VIDEO';
    if (isVideo) {
      img.style.display = 'none';
      video.style.display = 'block';
      video.src = target.currentSrc || target.src;
      video.load();
      video.play().catch(() => {});
    } else {
      video.pause();
      video.style.display = 'none';
      img.style.display = 'block';
      img.src = target.src;
      img.alt = target.alt || '';
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeZoom() {
    video.pause();
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeZoom);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === img) closeZoom(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeZoom(); });

  // Délégation d'événement : fonctionne aussi pour les images/vidéos ajoutées
  // après coup (ex : galerie, réalisations ou boutique chargées depuis l'API).
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('img.zoomable, video.zoomable');
    if (target) openZoom(target);
  });
}

