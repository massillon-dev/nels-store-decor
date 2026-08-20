/* ==========================================================================
   NEL'S STORE & DECOR — Boutique & Panier
   Gère l'affichage des produits, le panier (persisté dans localStorage — un
   panier client ordinaire de site web, pas un artifact Claude), le tiroir
   panier, et l'envoi de la commande groupée au serveur.
   ========================================================================== */

const CART_STORAGE_KEY = 'nels_cart_v1';
const SHOP_API = { products: '/api/products', categories: '/api/products/categories', orders: '/api/orders' };

let shopProducts = [];

/* ---------------------------------------------------------------------- */
/* GESTION DU PANIER (localStorage)                                       */
/* ---------------------------------------------------------------------- */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_path,
      mediaType: product.media_type || 'image',
      quantity,
    });
  }
  saveCart(cart);
  showCartToast(`${product.name} ajouté au panier`);
}

function updateCartItemQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.product_id === productId);
  if (!item) return;
  item.quantity += delta;
  const filtered = item.quantity <= 0 ? cart.filter(i => i.product_id !== productId) : cart;
  saveCart(filtered);
  renderCartDrawer();
}

function removeCartItem(productId) {
  const cart = getCart().filter(i => i.product_id !== productId);
  saveCart(cart);
  renderCartDrawer();
}

function clearCart() {
  saveCart([]);
  renderCartDrawer();
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} HTG`;
}

/* ---------------------------------------------------------------------- */
/* AFFICHAGE : badge + tiroir panier (injectés sur toutes les pages)      */
/* ---------------------------------------------------------------------- */
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = cartCount(getCart());
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartDrawer() {
  const itemsWrap = document.getElementById('cartDrawerItems');
  const footer = document.getElementById('cartDrawerFooter');
  if (!itemsWrap) return;

  const cart = getCart();
  if (!cart.length) {
    itemsWrap.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-basket-shopping"></i><p>Votre panier est vide.</p></div>';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  itemsWrap.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.product_id}">
      ${item.mediaType === 'video'
        ? `<video src="${item.image}" muted preload="metadata"></video>`
        : `<img src="${item.image}" alt="${escapeHTML(item.name)}">`}
      <div class="cart-item-info">
        <h4>${escapeHTML(item.name)}</h4>
        <span class="price">${formatPrice(item.price)}</span>
        <div class="cart-item-qty">
          <button class="qty-minus" data-id="${item.product_id}"><i class="fa-solid fa-minus"></i></button>
          <span>${item.quantity}</span>
          <button class="qty-plus" data-id="${item.product_id}"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.product_id}" title="Retirer"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');

  document.getElementById('cartTotalValue').textContent = formatPrice(cartTotal(cart));

  itemsWrap.querySelectorAll('.qty-plus').forEach(btn => btn.addEventListener('click', () => updateCartItemQuantity(Number(btn.dataset.id), 1)));
  itemsWrap.querySelectorAll('.qty-minus').forEach(btn => btn.addEventListener('click', () => updateCartItemQuantity(Number(btn.dataset.id), -1)));
  itemsWrap.querySelectorAll('.cart-item-remove').forEach(btn => btn.addEventListener('click', () => removeCartItem(Number(btn.dataset.id))));
}

function openCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

function showCartToast(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.style.cssText = 'position:fixed;bottom:100px;right:26px;background:var(--navy);color:#fff;padding:14px 22px;border-radius:12px;font-size:0.88rem;z-index:1600;box-shadow:var(--shadow-strong);transform:translateY(20px);opacity:0;transition:all 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; });
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.transform = 'translateY(20px)'; toast.style.opacity = '0'; }, 2400);
}

function setupCartControls() {
  const floatBtn = document.getElementById('cartFloatBtn');
  const closeBtn = document.getElementById('cartDrawerClose');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (floatBtn) floatBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!getCart().length) return;
      window.location.href = '/boutique/commande';
    });
  }

  updateCartBadge();
}

/* ---------------------------------------------------------------------- */
/* PAGE BOUTIQUE : grille de produits                                     */
/* ---------------------------------------------------------------------- */
async function initShopPage() {
  const grid = document.getElementById('shopGrid');
  const filtersWrap = document.getElementById('shopFilters');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const [products, categories] = await Promise.all([
      fetch(SHOP_API.products).then(r => r.json()),
      fetch(SHOP_API.categories).then(r => r.json()),
    ]);
    shopProducts = products;
    renderShopFilters(filtersWrap, categories);
    renderShopGrid(grid, products);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-basket-shopping"></i><p>${err.message}</p></div>`;
  }
}

function renderShopFilters(wrap, categories) {
  if (!wrap) return;
  const all = ['Tous', ...categories];
  wrap.innerHTML = all.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      wrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const grid = document.getElementById('shopGrid');
      grid.innerHTML = '<div class="spinner"></div>';
      const cat = btn.dataset.cat;
      const url = cat === 'Tous' ? SHOP_API.products : `${SHOP_API.products}?category=${encodeURIComponent(cat)}`;
      const products = await fetch(url).then(r => r.json());
      shopProducts = products;
      renderShopGrid(grid, products);
    });
  });
}

function renderShopGrid(grid, products) {
  if (!products.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-basket-shopping"></i><p>Aucun produit dans cette catégorie pour le moment.</p></div>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card" data-reveal>
      <div class="product-card-img">
        ${p.media_type === 'video'
          ? `<video src="${p.image_path}" muted loop playsinline preload="metadata" class="zoomable"></video><span class="media-play-icon"><i class="fa-solid fa-play"></i></span>`
          : `<img src="${p.image_path}" alt="${escapeHTML(p.name)}" loading="lazy" class="zoomable">`}
        ${!p.in_stock ? '<span class="product-card-badge out">Rupture de stock</span>' : ''}
      </div>
      <div class="product-card-body">
        <span class="cat">${escapeHTML(p.category)}</span>
        <h3>${escapeHTML(p.name)}</h3>
        <p>${escapeHTML(p.description || '')}</p>
        <div class="product-card-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="product-add-btn" data-id="${p.id}" ${!p.in_stock ? 'disabled' : ''} title="Ajouter au panier">
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.product-card-img').forEach(el => {
    const video = el.querySelector('video');
    if (video) {
      el.addEventListener('mouseenter', () => video.play().catch(() => {}));
      el.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    }
  });

  grid.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = shopProducts.find(p => p.id === Number(btn.dataset.id));
      if (product) addToCart(product);
    });
  });

  setupScrollReveal();
}

/* ---------------------------------------------------------------------- */
/* PAGE COMMANDE (checkout) : récapitulatif + formulaire                  */
/* ---------------------------------------------------------------------- */
function initCheckoutPage() {
  const summaryWrap = document.getElementById('checkoutSummary');
  const form = document.getElementById('checkoutForm');
  if (!summaryWrap || !form) return;

  const cart = getCart();
  if (!cart.length) {
    summaryWrap.innerHTML = '<p>Votre panier est vide. <a href="/boutique" style="color:var(--rose); font-weight:600;">Retourner à la boutique</a></p>';
    form.style.display = 'none';
    return;
  }

  summaryWrap.innerHTML = cart.map(item => `
    <div class="checkout-summary-item">
      <span>${escapeHTML(item.name)} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('') + `
    <div class="checkout-summary-total">
      <span>Total</span>
      <span>${formatPrice(cartTotal(cart))}</span>
    </div>
  `;

  const alertBox = document.getElementById('checkoutAlert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';
    if (alertBox) { alertBox.className = 'form-alert'; alertBox.textContent = ''; }

    const payload = {
      full_name: form.full_name.value,
      phone: form.phone.value,
      email: form.email.value,
      address: form.address.value,
      delivery_date: form.delivery_date.value,
      notes: form.notes.value,
      items: getCart().map(item => ({ product_id: item.product_id, quantity: item.quantity })),
    };

    try {
      const res = await fetch(SHOP_API.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');

      clearCart();
      summaryWrap.innerHTML = '';
      form.style.display = 'none';
      document.getElementById('checkoutSuccess').style.display = 'block';
      document.getElementById('checkoutSuccess').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'form-alert show error';
        alertBox.textContent = err.message;
      }
      btn.disabled = false;
      btn.innerHTML = 'Confirmer ma commande <i class="fa-solid fa-check"></i>';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCartControls();
  initShopPage();
  initCheckoutPage();
});
