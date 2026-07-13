/* ============================================================
   LAOT NIAGA — AUTH.JS v2 | Alias compat layer
   Logika login/register sudah ada di login.html & register.html
   File ini hanya menjaga kompatibilitas backward
   ============================================================ */

// Alias fungsi lama → fungsi baru di api.js
const login    = (email, password) => loginApi(email, password);
const register = payload => registerApi(payload);

// Backward compat showUser (sudah ada di theme.js updateNavAuth)
function showUser() {
  const user = getUser();
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user.store_name || user.name || 'Pengguna';
  });
}

// Backward compat protectDashboard
function protectDashboard() {
  if (!document.body.dataset.dashboard) return;
  const user = getUser();
  if (!user) { location.href = 'login.html'; return; }
  if (user.role !== 'umkm') { location.href = 'marketplace.html'; }
}

document.addEventListener('DOMContentLoaded', () => {
  showUser();
  protectDashboard();
});