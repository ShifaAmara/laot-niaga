/* ===========================================
   LAOT NIAGA
   API.JS
=========================================== */

const API_URL = "http://localhost:5000/api";
const UPLOAD_URL = "http://localhost:5000";

/* ===========================================
   DEMO DATA
=========================================== */

const demoProducts = [
  {
    id: 1,
    name: "Keumamah Premium",
    category: "Ikan Olahan",
    price: 45000,
    stock: 24,
    unit: "pack",
    image: "assets/img/keumamah.jpg",
    store_name: "Dapur Laot Leupung",
    seller_id: 1,
    seller_name: "Sari Pesisir",
    seller_address: "Leupung, Aceh Besar",
    origin: "Leupung, Aceh Besar",
    ingredients: "Ikan tongkol, garam, rempah Aceh",
    production_method: "Dikukus lalu dikeringkan",
    expiry_info: "6 Bulan",
    description: "Ikan kayu khas Aceh."
  },
  {
    id: 2,
    name: "Abon Ikan Laut",
    category: "Abon",
    price: 38000,
    stock: 30,
    unit: "Jar",
    image: "assets/img/abon ikan.jpg",
    store_name: "UMKM Bahari",
    seller_id: 2,
    seller_name: "Rahmi",
    seller_address: "Banda Aceh",
    origin: "Banda Aceh",
    ingredients: "Ikan Laut",
    production_method: "Disuwir",
    expiry_info: "4 Bulan",
    description: "Abon ikan khas Aceh."
  },
  {
    id: 3,
    name: "Kerupuk Ikan",
    category: "Kerupuk",
    price: 22000,
    stock: 50,
    unit: "Pack",
    image: "assets/img/kerupuk ikan.jpg",
    store_name: "Pesisir Snack",
    seller_id: 3,
    seller_name: "Andi",
    seller_address: "Meulaboh",
    origin: "Meulaboh",
    ingredients: "Ikan Segar",
    production_method: "Dijemur",
    expiry_info: "3 Bulan",
    description: "Kerupuk ikan renyah."
  }
];

/* ===========================================
   SESSION
=========================================== */

function getToken() {
  return localStorage.getItem("laotToken");
}

function getUser() {
  return JSON.parse(localStorage.getItem("laotUser") || "null");
}

function saveSession(data) {
  localStorage.setItem("laotToken", data.token);
  localStorage.setItem("laotUser", JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem("laotToken");
  localStorage.removeItem("laotUser");
  location.href = "login.html";
}

/* ===========================================
   FORMAT RUPIAH
=========================================== */

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

/* ===========================================
   API
=========================================== */

async function api(path, options = {}) {

  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(API_URL + path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi Kesalahan");
  }

  return data;
}

/* ===========================================
   LOGIN
=========================================== */

async function login(email, password) {

  return await api("/auth/login", {

    method: "POST",

    body: JSON.stringify({
      email,
      password
    })

  });

}

/* ===========================================
   REGISTER
=========================================== */

async function register(payload) {

  return await api("/auth/register", {

    method: "POST",

    body: JSON.stringify(payload)

  });

}

/* ===========================================
   PRODUCTS
=========================================== */

async function getProducts() {

  try {

    const data = await api("/products");

    if (data.products) {
      return data.products;
    }

    return demoProducts;

  } catch (e) {

    console.log("Mode Demo");

    return demoProducts;

  }

}

/* ===========================================
   DASHBOARD
=========================================== */

async function getDashboard() {

  return await api("/products/dashboard/me");

}

/* ===========================================
   TAMBAH PRODUK
=========================================== */

async function addProduct(formData) {

  return await api("/products", {

    method: "POST",

    body: formData

  });

}

/* ===========================================
   ORDER
=========================================== */

async function createOrder(payload) {

  return await api("/orders", {

    method: "POST",

    body: JSON.stringify(payload)

  });

}

/* ===========================================
   GAMBAR
=========================================== */

function productImage(product) {

  if (!product.image) {

    return "assets/img/keumamah.jpg";

  }

  if (product.image.startsWith("/uploads")) {

    return UPLOAD_URL + product.image;

  }

  return product.image;

}