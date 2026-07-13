/* ============================================================
   LAOT NIAGA — THEME.JS | Dark/Light, Noise, Toast, Reveal
   ============================================================ */

/* ─── Noise Background ──────────────────────────────────────── */
function initNoise() {
  const el = document.getElementById('noiseLayer');
  if (!el) return;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = 256; c.height = 256;
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.backgroundImage = `url(${c.toDataURL()})`;
}

/* ─── Theme Toggle ──────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('lnTheme') || 'light';
  applyTheme(saved);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next); localStorage.setItem('lnTheme', next);
    });
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
  });
}

/* ─── Scroll Reveal ─────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ─── Navbar Scroll ─────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector('.ln-navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), { passive: true });
}

/* ─── Toast ─────────────────────────────────────────────────── */
function showToast(msg, type = 'info', duration = 3500) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const t = document.createElement('div');
  t.className = `ln-toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||icons.info}</span><span>${msg}</span>`;
  stack.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, duration);
  return t;
}
window.showToast = showToast;

/* ─── Mobile Navbar Toggle ──────────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.navbar-toggler');
  if (toggle) toggle.addEventListener('click', () => {
    document.querySelector('.navbar-collapse')?.classList.toggle('show');
  });
}

/* ─── Smooth Scroll ─────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ─── Cart Badge ────────────────────────────────────────────── */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('lnCart') || '[]');
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? '' : 'none';
  });
}
window.updateCartBadge = updateCartBadge;

/* ─── Nav Auth State ────────────────────────────────────────── */
function updateNavAuth() {
  const user = typeof getUser === 'function' ? getUser() : null;
  document.querySelectorAll('[data-show-guest]').forEach(el => el.style.display = user ? 'none' : '');
  document.querySelectorAll('[data-show-auth]').forEach(el => el.style.display = user ? '' : 'none');
  document.querySelectorAll('[data-user-name]').forEach(el => { if (user) el.textContent = user.store_name || user.name; });
}
window.updateNavAuth = updateNavAuth;

/* ─── INIT ALL ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNoise();
  initTheme();
  initReveal();
  initNavScroll();
  initMobileNav();
  initSmoothScroll();
  updateCartBadge();
  updateNavAuth();
});
