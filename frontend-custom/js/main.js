const API_URL = "http://localhost:5000/api";
const UPLOAD_URL = "http://localhost:5000";

const demoProducts = [
  {
    id: 1,
    name: "Keumamah Premium",
    category: "Ikan Olahan",
    price: 45000,
    stock: 24,
    unit: "pack",
    image: "assets/img/product-keumamah.svg",
    store_name: "Dapur Laot Leupung",
    seller_id: 1,
    seller_name: "Sari Pesisir",
    seller_address: "Leupung, Aceh Besar",
    origin: "Leupung, Aceh Besar",
    ingredients: "Ikan tongkol, garam, rempah Aceh",
    production_method: "Dikukus, dikeringkan, lalu dikemas higienis.",
    expiry_info: "6 bulan setelah produksi",
    description: "Ikan kayu khas Aceh dengan rasa gurih dan tekstur padat. Cocok untuk stok dapur dan oleh-oleh."
  },
  {
    id: 2,
    name: "Abon Ikan Laut",
    category: "Siap Santap",
    price: 38000,
    stock: 30,
    unit: "jar",
    image: "assets/img/product-abon.svg",
    store_name: "Dapur Laot Leupung",
    seller_id: 1,
    seller_name: "Sari Pesisir",
    seller_address: "Leupung, Aceh Besar",
    origin: "Aceh Besar",
    ingredients: "Ikan laut, bawang, cabai, rempah",
    production_method: "Disuwir, dibumbui, dan disangrai hingga kering.",
    expiry_info: "Simpan di tempat kering",
    description: "Abon ikan lembut berbumbu Aceh, praktis untuk lauk harian dan paket hampers UMKM."
  },
  {
    id: 3,
    name: "Kerupuk Ikan Pesisir",
    category: "Camilan Laut",
    price: 22000,
    stock: 45,
    unit: "bungkus",
    image: "assets/img/product-kerupuk.svg",
    store_name: "Lhok Snack Bahari",
    seller_id: 2,
    seller_name: "Rahmi Bahari",
    seller_address: "Banda Aceh",
    origin: "Banda Aceh",
    ingredients: "Ikan segar, tapioka, bawang putih",
    production_method: "Adonan dipotong tipis dan dijemur sebelum digoreng.",
    expiry_info: "3 bulan dalam kemasan tertutup",
    description: "Kerupuk ikan renyah dengan rasa laut ringan, cocok untuk camilan keluarga."
  }
];

const rupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(value || 0);

const token = () => localStorage.getItem("laotToken");
const currentUser = () => JSON.parse(localStorage.getItem("laotUser") || "null");
const setSession = (data) => {
  localStorage.setItem("laotToken", data.token);
  localStorage.setItem("laotUser", JSON.stringify(data.user));
};

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
  if (product.image.startsWith("assets/")) return product.image;
  return "assets/img/product-keumamah.svg";
}

function card(product) {
  return `
    <article class="product-card bg-white">
      <img src="${productImage(product)}" alt="${product.name}">
      <div class="p-3">
        <div class="d-flex justify-content-between gap-2 mb-2">
          <span class="badge badge-laot rounded-pill">${product.category}</span>
          <small class="text-muted">Stok ${product.stock}</small>
        </div>
        <h3 class="h5 fw-bold">${product.name}</h3>
        <p class="text-muted small mb-2">${product.store_name || product.seller_name}</p>
        <p class="fw-bold mb-3">${rupiah(product.price)} / ${product.unit}</p>
        <a class="btn btn-outline-laot w-100" href="product-detail.html?id=${product.id}">Lihat Detail</a>
      </div>
    </article>
  `;
}

async function renderFeaturedProducts() {
  const target = document.querySelector("[data-featured-products]");
  if (!target) return;
  const products = await getProducts();
  target.innerHTML = products.slice(0, 3).map((product) => `<div class="col-md-4">${card(product)}</div>`).join("");
}

async function renderMarketplace() {
  const grid = document.querySelector("[data-marketplace-grid]");
  if (!grid) return;
  const search = document.querySelector("[data-search]");
  const category = document.querySelector("[data-category]");
  const products = await getProducts();

  function paint() {
    const q = (search?.value || "").toLowerCase();
    const cat = category?.value || "";
    const filtered = products.filter((item) => {
      const matchesText = [item.name, item.description, item.store_name].join(" ").toLowerCase().includes(q);
      const matchesCategory = !cat || item.category === cat;
      return matchesText && matchesCategory;
    });
    grid.innerHTML = filtered.map((product) => `<div class="col-md-4">${card(product)}</div>`).join("") || `<p class="text-muted">Produk belum ditemukan.</p>`;
  }

  search?.addEventListener("input", paint);
  category?.addEventListener("change", paint);
  paint();
}

async function renderProductDetail() {
  const target = document.querySelector("[data-product-detail]");
  if (!target) return;
  const id = Number(new URLSearchParams(location.search).get("id") || 1);
  const products = await getProducts();
  const product = products.find((item) => Number(item.id) === id) || products[0];

  target.innerHTML = `
    <div class="row g-4 align-items-start">
      <div class="col-lg-6"><img class="img-fluid rounded-3 shadow-sm w-100" src="${productImage(product)}" alt="${product.name}"></div>
      <div class="col-lg-6">
        <span class="badge badge-laot rounded-pill mb-3">${product.category}</span>
        <h1 class="section-title">${product.name}</h1>
        <p class="lead text-muted">${product.description}</p>
        <h2 class="h3 fw-bold">${rupiah(product.price)} <small class="text-muted fs-6">/ ${product.unit}</small></h2>
        <div class="row g-3 my-3">
          <div class="col-6"><div class="stat p-3 rounded-3"><strong>Stok</strong><br>${product.stock} ${product.unit}</div></div>
          <div class="col-6"><div class="stat p-3 rounded-3"><strong>Asal</strong><br>${product.origin}</div></div>
        </div>
        <ul class="list-group list-group-flush mb-4">
          <li class="list-group-item"><strong>Bahan:</strong> ${product.ingredients}</li>
          <li class="list-group-item"><strong>Proses:</strong> ${product.production_method}</li>
          <li class="list-group-item"><strong>Ketahanan:</strong> ${product.expiry_info}</li>
          <li class="list-group-item"><strong>UMKM:</strong> ${product.store_name || product.seller_name}</li>
        </ul>
        <button class="btn btn-laot btn-lg" data-order="${product.id}">Pesan Sekarang</button>
        <a class="btn btn-outline-laot btn-lg ms-2" href="profil-umkm.html?seller=${product.seller_id || 1}">Profil UMKM</a>
      </div>
    </div>
  `;

  document.querySelector("[data-order]")?.addEventListener("click", async () => {
    if (!token()) {
      alert("Silakan login sebagai pembeli terlebih dahulu.");
      location.href = "login.html";
      return;
    }
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({ items: [{ product_id: product.id, quantity: 1 }], shipping_address: currentUser()?.address || "" })
      });
      alert("Pesanan berhasil dibuat.");
    } catch (error) {
      alert(error.message);
    }
  });
}

async function renderDashboard() {
  const list = document.querySelector("[data-dashboard-products]");
  if (!list) return;
  const user = currentUser();
  document.querySelector("[data-user-name]").textContent = user?.store_name || user?.name || "UMKM Laot Niaga";

  let products = demoProducts;
  let summary = { product_count: 3, sold_items: 18, revenue: 760000 };
  try {
    const data = await api("/products/dashboard/me");
    products = data.products;
    summary = data.summary;
  } catch (_error) {}

  document.querySelector("[data-count-products]").textContent = summary.product_count || products.length;
  document.querySelector("[data-sold-items]").textContent = summary.sold_items || 0;
  document.querySelector("[data-revenue]").textContent = rupiah(summary.revenue || 0);
  list.innerHTML = products.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${rupiah(item.price)}</td>
      <td>${item.stock}</td>
      <td><span class="badge text-bg-success">${item.status || "active"}</span></td>
    </tr>
  `).join("");
}

function initProductForm() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token()) {
      alert("Login sebagai UMKM untuk menambah produk.");
      location.href = "login.html";
      return;
    }
    try {
      await api("/products", { method: "POST", body: new FormData(form) });
      alert("Produk berhasil ditambahkan.");
      form.reset();
      renderDashboard();
    } catch (error) {
      alert(error.message);
    }
  });
}

function initAuthForms() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      location.href = data.user.role === "umkm" ? "dashboard-umkm.html" : "marketplace.html";
    } catch (error) {
      alert(error.message);
    }
  });

  document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      setSession(data);
      location.href = payload.role === "umkm" ? "dashboard-umkm.html" : "marketplace.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

function initAi() {
  const form = document.querySelector("[data-ai-form]");
  const chat = document.querySelector("[data-ai-chat]");
  if (!form || !chat) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    chat.insertAdjacentHTML("beforeend", `<div class="chat-bubble mb-3">${payload.product_name} dari ${payload.origin}</div>`);
    try {
      const data = await api("/ai/branding", { method: "POST", body: JSON.stringify(payload) });
      const result = data.result;
      chat.insertAdjacentHTML("beforeend", `
        <div class="chat-bubble ai mb-3">
          <strong>Nama merek:</strong> ${result.brand_names.join(", ")}<br>
          <strong>Slogan:</strong> ${result.slogans[0]}<br>
          <strong>Deskripsi:</strong> ${result.description}
        </div>
      `);
    } catch (_error) {
      const name = payload.product_name || "Produk Laut Aceh";
      chat.insertAdjacentHTML("beforeend", `
        <div class="chat-bubble ai mb-3">
          <strong>Nama merek:</strong> ${name} Laot Rasa, Pesisir ${name}<br>
          <strong>Slogan:</strong> Rasa laut Aceh, sampai ke meja keluarga.<br>
          <strong>Deskripsi:</strong> ${name} dibuat untuk memperkuat branding UMKM hasil laut Aceh.
        </div>
      `);
    }
    form.reset();
    chat.scrollTop = chat.scrollHeight;
  });
}

async function renderSellerProfile() {
  const target = document.querySelector("[data-seller-profile]");
  if (!target) return;
  const sellerId = Number(new URLSearchParams(location.search).get("seller") || 1);
  const products = (await getProducts()).filter((item) => Number(item.seller_id || 1) === sellerId);
  const first = products[0] || demoProducts[0];
  target.innerHTML = `
    <section class="panel bg-white rounded-3 p-4 mb-4">
      <span class="badge badge-laot rounded-pill mb-3">Profil UMKM</span>
      <h1 class="section-title">${first.store_name}</h1>
      <p class="text-muted mb-0">${first.seller_address || first.origin}. UMKM pengolah hasil laut yang menjaga cita rasa lokal, informasi bahan, dan proses produksi transparan.</p>
    </section>
    <div class="row g-4">${products.map((item) => `<div class="col-md-4">${card(item)}</div>`).join("")}</div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedProducts();
  renderMarketplace();
  renderProductDetail();
  renderDashboard();
  initProductForm();
  initAuthForms();
  initAi();
  renderSellerProfile();
});
