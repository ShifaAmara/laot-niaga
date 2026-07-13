/* ============================================================
   LAOT NIAGA — Main Application JavaScript
   Modern Glassmorphism Marketplace
   ============================================================ */

const API_URL = "http://localhost:5000/api";
const UPLOAD_URL = "http://localhost:5000";

/* ── Demo Data ────────────────────────────────────────────── */
const demoProducts = [
  {
    id: 1, name: "Keumamah Premium", category: "Ikan Olahan",
    price: 45000, stock: 24, unit: "pack",
    image: "assets/img/product-keumamah.svg",
    store_name: "Dapur Laot Leupung", seller_id: 1,
    seller_name: "Sari Pesisir", seller_address: "Leupung, Aceh Besar",
    origin: "Leupung, Aceh Besar",
    ingredients: "Ikan tongkol, garam, rempah Aceh",
    production_method: "Dikukus, dikeringkan, lalu dikemas higienis.",
    expiry_info: "6 bulan setelah produksi",
    description: "Ikan kayu khas Aceh dengan rasa gurih dan tekstur padat. Cocok untuk stok dapur dan oleh-oleh."
  },
  {
    id: 2, name: "Abon Ikan Laut", category: "Siap Santap",
    price: 38000, stock: 30, unit: "jar",
    image: "assets/img/product-abon.svg",
    store_name: "Dapur Laot Leupung", seller_id: 1,
    seller_name: "Sari Pesisir", seller_address: "Leupung, Aceh Besar",
    origin: "Aceh Besar",
    ingredients: "Ikan laut, bawang, cabai, rempah",
    production_method: "Disuwir, dibumbui, dan disangrai hingga kering.",
    expiry_info: "Simpan di tempat kering",
    description: "Abon ikan lembut berbumbu Aceh, praktis untuk lauk harian dan paket hampers UMKM."
  },
  {
    id: 3, name: "Kerupuk Ikan Pesisir", category: "Camilan Laut",
    price: 22000, stock: 45, unit: "bungkus",
    image: "assets/img/product-kerupuk.svg",
    store_name: "Lhok Snack Bahari", seller_id: 2,
    seller_name: "Rahmi Bahari", seller_address: "Banda Aceh",
    origin: "Banda Aceh",
    ingredients: "Ikan segar, tapioka, bawang putih",
    production_method: "Adonan dipotong tipis dan dijemur sebelum digoreng.",
    expiry_info: "3 bulan dalam kemasan tertutup",
    description: "Kerupuk ikan renyah dengan rasa laut ringan, cocok untuk camilan keluarga."
  }
];

/* ── Utilities ────────────────────────────────────────────── */
const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const token = () => localStorage.getItem("laotToken");
const currentUser = () => JSON.parse(localStorage.getItem("laotUser") || "null");
const setSession = (data) => {
  localStorage.setItem("laotToken", data.token);
  localStorage.setItem("laotUser", JSON.stringify(data.user));
};
const clearSession = () => {
  localStorage.removeItem("laotToken");
  localStorage.removeItem("laotUser");
};

/* ── Toast Notification System ────────────────────────────── */
function initToastContainer() {
  if (document.querySelector('.toast-container')) return;
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
}

function showToast(message, type = 'info') {
  initToastContainer();
  const container = document.querySelector('.toast-container');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:1.1rem">${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ── API Helper ───────────────────────────────────────────── */
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request gagal.");
  return data;
}

/* ── Noise Background Generator ───────────────────────────── */
function initNoiseBackground() {
  const overlay = document.querySelector('.noise-overlay');
  if (!overlay) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 256;
  const imageData = ctx.createImageData(256, 256);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  overlay.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
}

/* ── Scroll Reveal Animation ──────────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
}

/* ── Animated Counter ─────────────────────────────────────── */
function animateCounter(element, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const isRupiah = element.dataset.counterType === 'rupiah';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = isRupiah ? rupiah(current) : current.toLocaleString('id-ID');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.dataset.counter) || 0;
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(el => observer.observe(el));
}

/* ── Navbar Scroll Effect ─────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Mobile toggle
  const toggle = navbar.querySelector('.nav-toggle');
  const links = navbar.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }

  // Highlight current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  navbar.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });
}

/* ── Update Nav for Auth State ────────────────────────────── */
function updateNavAuth() {
  const authButtons = document.querySelector('[data-nav-auth]');
  if (!authButtons) return;
  const user = currentUser();
  if (user && token()) {
    const dashLink = user.role === 'umkm' ? 'dashboard-umkm.html' : 'marketplace.html';
    authButtons.innerHTML = `
      <span class="btn btn-ghost" style="font-size:0.85rem">Halo, ${user.name?.split(' ')[0] || 'User'}</span>
      <a class="btn btn-outline btn-sm" href="${dashLink}">Dashboard</a>
      <button class="btn btn-ghost btn-sm" data-logout>Keluar</button>
    `;
    authButtons.querySelector('[data-logout]')?.addEventListener('click', () => {
      clearSession();
      showToast('Berhasil keluar.', 'info');
      setTimeout(() => location.href = 'index.html', 800);
    });
  }
}

/* ── Products ─────────────────────────────────────────────── */
async function getProducts() {
  try {
    const data = await api("/products");
    return data.products?.length ? data.products : demoProducts;
  } catch (_error) {
    return demoProducts;
  }
}

function productImage(product) {
  if (!product.image) return "assets/img/product-keumamah.svg";
  if (product.image.startsWith("/uploads")) return `${UPLOAD_URL}${product.image}`;
  if (product.image.startsWith("assets/") || product.image.startsWith("../assets/")) return product.image.replace('../', '');
  return "assets/img/product-keumamah.svg";
}

function card(product) {
  return `
    <article class="product-card">
      <div class="img-wrapper">
        <img src="${productImage(product)}" alt="${product.name}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <span class="badge">${product.category}</span>
          <span class="small text-muted">Stok ${product.stock}</span>
        </div>
        <h3 class="card-title">${product.name}</h3>
        <p class="card-seller">${product.store_name || product.seller_name}</p>
        <p class="card-price">${rupiah(product.price)} <small>/ ${product.unit}</small></p>
        <a class="btn btn-outline w-100" href="product-detail.html?id=${product.id}">Lihat Detail</a>
      </div>
    </article>
  `;
}

function skeletonCard() {
  return `
    <div class="skeleton-card skeleton"></div>
  `;
}

/* ── Render: Featured Products (Homepage) ─────────────────── */
async function renderFeaturedProducts() {
  const target = document.querySelector("[data-featured-products]");
  if (!target) return;
  target.innerHTML = Array(3).fill(skeletonCard()).join('');
  const products = await getProducts();
  target.innerHTML = products.slice(0, 3).map(p => card(p)).join("");
}

/* ── Render: Marketplace Grid ─────────────────────────────── */
async function renderMarketplace() {
  const grid = document.querySelector("[data-marketplace-grid]");
  if (!grid) return;
  const search = document.querySelector("[data-search]");
  const categorySelect = document.querySelector("[data-category]");
  const filterChips = document.querySelectorAll("[data-filter-chip]");

  grid.innerHTML = Array(6).fill(skeletonCard()).join('');
  const products = await getProducts();

  function paint() {
    const q = (search?.value || "").toLowerCase();
    const cat = categorySelect?.value || "";
    const filtered = products.filter(item => {
      const matchesText = [item.name, item.description, item.store_name].join(" ").toLowerCase().includes(q);
      const matchesCategory = !cat || item.category === cat;
      return matchesText && matchesCategory;
    });
    grid.innerHTML = filtered.length
      ? filtered.map(p => card(p)).join("")
      : `<div class="col-12 text-center p-5"><p class="text-muted">🔍 Produk belum ditemukan.</p></div>`;
  }

  search?.addEventListener("input", paint);
  categorySelect?.addEventListener("change", paint);
  
  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (categorySelect) {
        categorySelect.value = chip.dataset.filterChip;
        categorySelect.dispatchEvent(new Event('change'));
      }
    });
  });

  paint();
}

/* ── Render: Product Detail ───────────────────────────────── */
async function renderProductDetail() {
  const target = document.querySelector("[data-product-detail]");
  if (!target) return;
  const id = Number(new URLSearchParams(location.search).get("id") || 1);
  const products = await getProducts();
  const product = products.find(item => Number(item.id) === id) || products[0];
  if (!product) { target.innerHTML = '<p class="text-muted">Produk tidak ditemukan.</p>'; return; }

  target.innerHTML = `
    <div class="detail-grid">
      <div class="detail-image glass">
        <img src="${productImage(product)}" alt="${product.name}">
      </div>
      <div>
        <span class="badge mb-3">${product.category}</span>
        <h1 class="section-title mt-2 mb-2">${product.name}</h1>
        <p class="lead mb-4">${product.description}</p>
        <p class="mb-4" style="font-size:1.6rem;font-weight:800;color:var(--accent)">
          ${rupiah(product.price)} <span class="text-muted" style="font-size:0.9rem;font-weight:500">/ ${product.unit}</span>
        </p>
        <div class="detail-stat-grid mb-4">
          <div class="glass stat-card">
            <p class="small text-muted mb-1">📦 Stok Tersedia</p>
            <p class="fw-bold">${product.stock} ${product.unit}</p>
          </div>
          <div class="glass stat-card">
            <p class="small text-muted mb-1">📍 Asal Produk</p>
            <p class="fw-bold">${product.origin}</p>
          </div>
        </div>
        <div class="panel mb-4">
          <h2 style="font-size:1rem">Informasi Produk</h2>
          <div class="detail-info-list">
            <div class="detail-info-item"><strong>Bahan</strong> ${product.ingredients}</div>
            <div class="detail-info-item"><strong>Proses</strong> ${product.production_method}</div>
            <div class="detail-info-item"><strong>Ketahanan</strong> ${product.expiry_info}</div>
            <div class="detail-info-item"><strong>UMKM</strong> ${product.store_name || product.seller_name}</div>
          </div>
        </div>
        <div class="cluster">
          <button class="btn btn-primary btn-lg btn-glow" data-order="${product.id}">🛒 Pesan Sekarang</button>
          <a class="btn btn-outline btn-lg" href="profil-umkm.html?seller=${product.seller_id || 1}">Profil UMKM</a>
        </div>
      </div>
    </div>
  `;

  document.querySelector("[data-order]")?.addEventListener("click", async () => {
    if (!token()) {
      showToast("Silakan login sebagai pembeli terlebih dahulu.", "error");
      setTimeout(() => location.href = "login.html", 1200);
      return;
    }
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({ items: [{ product_id: product.id, quantity: 1 }], shipping_address: currentUser()?.address || "" })
      });
      showToast("Pesanan berhasil dibuat! 🎉", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

/* ── Render: Dashboard ────────────────────────────────────── */
async function renderDashboard() {
  const list = document.querySelector("[data-dashboard-products]");
  if (!list) return;
  const user = currentUser();
  const nameEl = document.querySelector("[data-user-name]");
  if (nameEl) nameEl.textContent = user?.store_name || user?.name || "UMKM Laot Niaga";

  let products = demoProducts;
  let summary = { product_count: 3, sold_items: 18, revenue: 760000 };
  try {
    const data = await api("/products/dashboard/me");
    products = data.products;
    summary = data.summary;
  } catch (_error) {}

  // Animated counters
  const countProducts = document.querySelector("[data-count-products]");
  const soldItems = document.querySelector("[data-sold-items]");
  const revenue = document.querySelector("[data-revenue]");

  if (countProducts) {
    countProducts.dataset.counter = summary.product_count || products.length;
    countProducts.dataset.counterType = 'number';
  }
  if (soldItems) {
    soldItems.dataset.counter = summary.sold_items || 0;
    soldItems.dataset.counterType = 'number';
  }
  if (revenue) {
    revenue.dataset.counter = summary.revenue || 0;
    revenue.dataset.counterType = 'rupiah';
  }
  initCounterAnimation();

  list.innerHTML = products.map(item => `
    <tr>
      <td><span class="fw-bold" style="color:var(--text)">${item.name}</span></td>
      <td>${item.category}</td>
      <td>${rupiah(item.price)}</td>
      <td>${item.stock}</td>
      <td><span class="badge badge-success">${item.status || "active"}</span></td>
    </tr>
  `).join("");
}

/* ── Init: Product Form ───────────────────────────────────── */
function initProductForm() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token()) {
      showToast("Login sebagai UMKM untuk menambah produk.", "error");
      setTimeout(() => location.href = "login.html", 1200);
      return;
    }
    const btn = form.querySelector('button[type="submit"], button:not([type])');
    const originalText = btn?.textContent;
    if (btn) { btn.textContent = "Menyimpan..."; btn.disabled = true; }
    try {
      await api("/products", { method: "POST", body: new FormData(form) });
      showToast("Produk berhasil ditambahkan! 🎉", "success");
      form.reset();
      renderDashboard();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  });
}

/* ── Init: Auth Forms ─────────────────────────────────────── */
function initAuthForms() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const btn = event.currentTarget.querySelector('button');
    const originalText = btn?.textContent;
    if (btn) { btn.textContent = "Memproses..."; btn.disabled = true; }
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      showToast("Login berhasil! Mengalihkan...", "success");
      setTimeout(() => {
        location.href = data.user.role === "umkm" ? "dashboard-umkm.html" : "marketplace.html";
      }, 800);
    } catch (error) {
      showToast(error.message, "error");
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  });

  document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const btn = event.currentTarget.querySelector('button');
    const originalText = btn?.textContent;
    if (btn) { btn.textContent = "Mendaftar..."; btn.disabled = true; }
    try {
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      showToast("Registrasi berhasil! Selamat datang 🎉", "success");
      setTimeout(() => {
        location.href = payload.role === "umkm" ? "dashboard-umkm.html" : "marketplace.html";
      }, 800);
    } catch (error) {
      showToast(error.message, "error");
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  });
}

/* ── Init: NiagaAI Chat ───────────────────────────────────── */
function initAi() {
  const form = document.querySelector("[data-ai-form]");
  const chat = document.querySelector("[data-ai-chat]");
  if (!form || !chat) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));

    // User bubble
    chat.insertAdjacentHTML("beforeend",
      `<div class="chat-bubble mb-3">🐟 ${payload.product_name || 'Produk'} dari ${payload.origin || 'Aceh'}</div>`
    );

    // Typing indicator
    chat.insertAdjacentHTML("beforeend",
      `<div class="chat-bubble ai typing-indicator mb-3" data-typing><span></span><span></span><span></span></div>`
    );
    chat.scrollTop = chat.scrollHeight;

    try {
      const data = await api("/ai", {
        method: "POST",
        body: JSON.stringify({ prompt: `Buatkan branding untuk produk ${payload.product_name}, kategori ${payload.category || '-'}, asal ${payload.origin || '-'}, keunggulan: ${payload.unique_value || '-'}` })
      });

      // Remove typing indicator
      chat.querySelector('[data-typing]')?.remove();

      if (data.reply) {
        // General chat response
        chat.insertAdjacentHTML("beforeend", `
          <div class="chat-bubble ai mb-3">${data.reply.replace(/\n/g, '<br>')}</div>
        `);
      } else if (data.result) {
        // Structured branding response
        const result = data.result;
        chat.insertAdjacentHTML("beforeend", `
          <div class="chat-bubble ai mb-3">
            <strong>✨ Nama merek:</strong> ${Array.isArray(result.brand_names) ? result.brand_names.join(", ") : result.brand_names}<br>
            <strong>💬 Slogan:</strong> ${Array.isArray(result.slogans) ? result.slogans[0] : result.slogans}<br>
            <strong>📝 Deskripsi:</strong> ${result.description}
          </div>
        `);
      }
    } catch (_error) {
      chat.querySelector('[data-typing]')?.remove();
      const name = payload.product_name || "Produk Laut Aceh";
      chat.insertAdjacentHTML("beforeend", `
        <div class="chat-bubble ai mb-3">
          <strong>✨ Nama merek:</strong> ${name} Laot Rasa, Pesisir ${name}<br>
          <strong>💬 Slogan:</strong> Rasa laut Aceh, sampai ke meja keluarga.<br>
          <strong>📝 Deskripsi:</strong> ${name} dibuat untuk memperkuat branding UMKM hasil laut Aceh.
        </div>
      `);
    }
    form.reset();
    chat.scrollTop = chat.scrollHeight;
  });
}

/* ── Render: Seller Profile ───────────────────────────────── */
async function renderSellerProfile() {
  const target = document.querySelector("[data-seller-profile]");
  if (!target) return;
  const sellerId = Number(new URLSearchParams(location.search).get("seller") || 1);
  const products = (await getProducts()).filter(item => Number(item.seller_id || 1) === sellerId);
  const first = products[0] || demoProducts[0];
  const initials = (first.store_name || first.seller_name || "LN").split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  target.innerHTML = `
    <div class="glass profile-header mb-5 reveal">
      <div class="profile-avatar">${initials}</div>
      <span class="badge mb-3">Profil UMKM</span>
      <h1 class="section-title mt-2">${first.store_name || first.seller_name}</h1>
      <p class="text-muted" style="max-width:500px;margin:8px auto 0">
        📍 ${first.seller_address || first.origin} — UMKM pengolah hasil laut yang menjaga cita rasa lokal, informasi bahan, dan proses produksi transparan.
      </p>
    </div>
    <div class="section-header reveal">
      <h2 class="section-title" style="font-size:1.4rem">Produk UMKM</h2>
    </div>
    <div class="products-grid">
      ${products.map(item => card(item)).join("")}
    </div>
  `;
  initScrollReveal();
}

/* ── Init Everything on DOM Ready ─────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initNoiseBackground();
  initNavbar();
  initScrollReveal();
  initCounterAnimation();
  updateNavAuth();
  renderFeaturedProducts();
  renderMarketplace();
  renderProductDetail();
  renderDashboard();
  initProductForm();
  initAuthForms();
  initAi();
  renderSellerProfile();
});
