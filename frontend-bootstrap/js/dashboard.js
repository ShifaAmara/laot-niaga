/* ============================================================
   LAOT NIAGA — DASHBOARD.JS | Data helpers dashboard penjual
   ============================================================ */

async function renderDashboard() {
  const list = document.querySelector('[data-dashboard-products]');
  if (!list) return;
  const user = getUser();
  if (!user) return;
  const el = document.querySelector('[data-user-name]');
  if (el) el.textContent = user.store_name || user.name || 'UMKM Laot Niaga';

  let products = DEMO_PRODUCTS;
  let summary = { product_count: DEMO_PRODUCTS.length, sold_items: 481, revenue: 8540000, orders_new: 5 };
  try {
    const data = await getDashboard();
    if (data.products) products = data.products;
    if (data.summary) summary = data.summary;
  } catch {}

  // Stat cards
  const countEl = document.querySelector('[data-count-products]');
  const soldEl  = document.querySelector('[data-sold-items]');
  const revEl   = document.querySelector('[data-revenue]');
  if (countEl) countEl.textContent = summary.product_count;
  if (soldEl)  soldEl.textContent  = summary.sold_items;
  if (revEl)   revEl.textContent   = shortRupiah(summary.revenue);

  // Table
  list.innerHTML = products.map(item => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${productImage(item)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover">
          <span class="fw-600 small">${item.name}</span>
        </div>
      </td>
      <td><span class="badge badge-laot rounded-pill">${item.category}</span></td>
      <td class="fw-700 small">${rupiah(item.price)}</td>
      <td><span class="${item.stock<10?'text-danger':item.stock<20?'text-warning':''} fw-700">${item.stock}</span></td>
      <td><span class="badge badge-teal rounded-pill">Aktif</span></td>
    </tr>
  `).join('');
}

function initProductForm() {
  const form = document.querySelector('[data-product-form]');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!getToken()) { showToast('Login sebagai UMKM untuk menambah produk','error'); location.href='login.html'; return; }
    try {
      await addProduct(new FormData(form));
      showToast('Produk berhasil ditambahkan ✓','success');
      form.reset();
      renderDashboard();
    } catch (err) {
      showToast(err.message,'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  initProductForm();
});
