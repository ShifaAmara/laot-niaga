/* ============================================================
   LAOT NIAGA — API.JS v3 | HTTP Client + Demo Fallback
   Semua panggilan ke backend melalui file ini.
   Mode demo otomatis aktif jika backend tidak terhubung.
   ============================================================ */

// Ganti URL ini dengan URL Backend kamu nanti (contoh: 'https://laot-niaga-api.onrender.com/api')
// Biarkan 'http://localhost:5000/api' jika masih testing di komputer lokal (XAMPP)
const API_URL    = 'http://localhost:5000/api'; 
const UPLOAD_URL = 'http://localhost:5000'; // Akan tidak digunakan jika pakai ImgBB


/* ─── Demo Data ─────────────────────────────────────────────── */
const DEMO_PRODUCTS = [
  { id:1, name:'Keumamah Premium Aceh', category:'Ikan Olahan', price:45000, original_price:55000,
    stock:24, unit:'pack', rating:4.8, sold:214, weight:200,
    image:'assets/img/keumamah.jpg',
    store_name:'Dapur Laot Leupung', seller_id:1, seller_name:'Sari Pesisir',
    seller_address:'Leupung, Aceh Besar', origin:'Leupung, Aceh Besar',
    ingredients:'Ikan tongkol segar, garam laut, rempah Aceh pilihan',
    production_method:'Dikukus dengan tekanan tinggi, dikeringkan alami, dikemas vakum higienis.',
    expiry_info:'6 bulan setelah produksi dalam kemasan tertutup',
    description:'Keumamah adalah ikan kayu khas Aceh yang telah menjadi warisan kuliner pesisir selama berabad-abad. Dibuat dari ikan tongkol segar pilihan nelayan Leupung yang terkenal kualitasnya.\n\nCocok untuk stok dapur, oleh-oleh khas Aceh, maupun hampers premium UMKM. Kaya protein dan bebas bahan pengawet.\n\nSajikan dengan santan atau kuah kuning untuk cita rasa Aceh yang autentik.',
    tags:['Tanpa Pengawet','Vakum','Halal','UMKM Aceh'] },
  { id:2, name:'Abon Ikan Laut Spesial', category:'Siap Santap', price:38000, original_price:null,
    stock:30, unit:'jar', rating:4.7, sold:178, weight:150,
    image:'assets/img/abon ikan.jpg',
    store_name:'Dapur Laot Leupung', seller_id:1, seller_name:'Sari Pesisir',
    seller_address:'Leupung, Aceh Besar', origin:'Aceh Besar',
    ingredients:'Ikan laut segar, bawang merah, bawang putih, cabai, rempah pilihan',
    production_method:'Ikan disuwir halus, dibumbui rempah Aceh, disangrai hingga kering sempurna.',
    expiry_info:'4 bulan, simpan di tempat kering',
    description:'Abon ikan laut dibuat dari ikan segar pilihan langsung dari nelayan. Dibumbui dengan resep rempah Aceh turun-temurun yang kaya rasa. Teksturnya lembut namun renyah, gurih alami tanpa MSG.',
    tags:['No MSG','Halal','Pedas Sedang'] },
  { id:3, name:'Kerupuk Ikan Pesisir Renyah', category:'Camilan Laut', price:22000, original_price:28000,
    stock:45, unit:'bungkus', rating:4.6, sold:302, weight:100,
    image:'assets/img/kerupuk ikan.jpg',
    store_name:'Lhok Snack Bahari', seller_id:2, seller_name:'Rahmi Bahari',
    seller_address:'Banda Aceh', origin:'Banda Aceh',
    ingredients:'Ikan segar, tepung tapioka, bawang putih, garam',
    production_method:'Adonan ikan segar dihaluskan, dibentuk, dijemur 2 hari, siap digoreng.',
    expiry_info:'3 bulan dalam kemasan tertutup rapat',
    description:'Kerupuk ikan pesisir dibuat dari ikan segar pilihan yang langsung diolah di hari yang sama. Bebas pewarna dan pengawet buatan.',
    tags:['Tanpa Pewarna','Halal','Renyah'] },
  { id:4, name:'Terasi Udang Premium', category:'Bumbu Laut', price:18000, original_price:null,
    stock:60, unit:'bungkus', rating:4.9, sold:521, weight:100,
    image:'assets/img/keumamah.jpg',
    store_name:'Lhok Snack Bahari', seller_id:2, seller_name:'Rahmi Bahari',
    seller_address:'Banda Aceh', origin:'Aceh Barat',
    ingredients:'Udang rebon segar, garam laut berkualitas',
    production_method:'Udang rebon difermentasi alami 30 hari, dipress dan dikeringkan.',
    expiry_info:'12 bulan dalam kemasan kedap udara',
    description:'Terasi udang premium dari udang rebon segar Aceh Barat. Difermentasi alami selama 30 hari tanpa bahan kimia tambahan.',
    tags:['Fermentasi Alami','Halal','Premium'] },
  { id:5, name:'Ikan Asin Kembung Pilihan', category:'Ikan Olahan', price:32000, original_price:38000,
    stock:18, unit:'kg', rating:4.5, sold:145, weight:500,
    image:'assets/img/abon ikan.jpg',
    store_name:'Nelayan Segar Sabang', seller_id:3, seller_name:'Pak Karim',
    seller_address:'Sabang, Aceh', origin:'Sabang',
    ingredients:'Ikan kembung segar, garam laut alami',
    production_method:'Ikan dibelah, diasinkan dengan garam laut, dijemur 3 hari.',
    expiry_info:'6 bulan dalam penyimpanan kering',
    description:'Ikan asin kembung dari perairan Sabang. Diasinkan dengan garam laut alami tanpa pengawet kimia.',
    tags:['Tanpa Pengawet','Halal','Segar'] },
  { id:6, name:'Bakso Ikan Tuna Jumbo', category:'Siap Santap', price:55000, original_price:65000,
    stock:15, unit:'pack', rating:4.8, sold:89, weight:300,
    image:'assets/img/kerupuk ikan.jpg',
    store_name:'Dapur Laot Leupung', seller_id:1, seller_name:'Sari Pesisir',
    seller_address:'Leupung, Aceh Besar', origin:'Aceh Besar',
    ingredients:'Ikan tuna segar, tepung, putih telur, bawang putih, garam',
    production_method:'Ikan tuna segar digiling halus, dibentuk bulat besar, direbus matang, dikemas vakum.',
    expiry_info:'3 bulan dalam freezer, 3 hari di kulkas',
    description:'Bakso ikan tuna jumbo dengan kandungan daging ikan hingga 80%. Dibuat dari ikan tuna segar pilihan.',
    tags:['80% Daging Ikan','Vakum','Halal','High Protein'] }
];

const DEMO_SELLERS = [
  { id:1, name:'Dapur Laot Leupung', owner:'Sari Pesisir', avatar:'assets/img/logo biru.png',
    banner:'assets/img/lautpantai.png', rating:4.8, sold:481, followers:234, products:12,
    address:'Leupung, Aceh Besar', since:'2021',
    story:'UMKM pengolah hasil laut dengan bahan dari nelayan lokal. Berkomitmen pada kualitas, kebersihan, dan transparansi bahan.' },
  { id:2, name:'Lhok Snack Bahari', owner:'Rahmi Bahari', avatar:'assets/img/logo biru.png',
    banner:'assets/img/lautpantai.png', rating:4.7, sold:823, followers:412, products:8,
    address:'Banda Aceh', since:'2020',
    story:'Spesialis camilan laut khas Aceh yang telah melayani pembeli dari berbagai penjuru Indonesia.' },
  { id:3, name:'Nelayan Segar Sabang', owner:'Pak Karim', avatar:'assets/img/logo biru.png',
    banner:'assets/img/lautpantai.png', rating:4.5, sold:145, followers:98, products:5,
    address:'Sabang, Aceh', since:'2022',
    story:'Langsung dari nelayan ke meja makan Anda. Ikan asin berkualitas dari perairan Sabang.' }
];

const DEMO_ORDERS = [
  { id:'LN2024001', date:'20 Nov 2024', status:'done', total:83000, courier:'JNE', resi:'JNE-ACH123456789',
    items:[{name:'Keumamah Premium Aceh',qty:1,price:45000,img:'assets/img/keumamah.jpg'},
           {name:'Abon Ikan Laut Spesial',qty:1,price:38000,img:'assets/img/abon ikan.jpg'}] },
  { id:'LN2024002', date:'23 Nov 2024', status:'ship', total:55000, courier:'J&T', resi:'JT-BDG789012345',
    items:[{name:'Bakso Ikan Tuna Jumbo',qty:1,price:55000,img:'assets/img/kerupuk ikan.jpg'}] },
  { id:'LN2024003', date:'25 Nov 2024', status:'process', total:44000, courier:'SiCepat', resi:'-',
    items:[{name:'Kerupuk Ikan Pesisir',qty:2,price:22000,img:'assets/img/kerupuk ikan.jpg'}] }
];

const DEMO_REVIEWS = [
  { id:1, product_id:1, reviewer_name:'Ahmad Fauzi', rating:5, comment:'Rasa autentik Aceh banget! Kemasan rapi, pengiriman cepat. Sudah pesan 3x dan tidak pernah kecewa.',       created_at:'2024-11-10T08:30:00Z', reviewer_avatar:null },
  { id:2, product_id:1, reviewer_name:'Rina Marlina', rating:5, comment:'Mantap! Cocok banget buat masak opor dan kuah kuning. Keluarga suka semua.',                             created_at:'2024-11-05T14:15:00Z', reviewer_avatar:null },
  { id:3, product_id:1, reviewer_name:'Budi Santoso', rating:4, comment:'Enak dan original. Pengiriman agak lama tapi produknya sepadan. Recommended buat oleh-oleh!',           created_at:'2024-10-28T10:45:00Z', reviewer_avatar:null }
];

/* ─── Session ───────────────────────────────────────────────── */
const getToken     = () => localStorage.getItem('laotToken');
const getUser      = () => JSON.parse(localStorage.getItem('laotUser') || 'null');
const saveSession  = d => {
  localStorage.setItem('laotToken', d.token);
  localStorage.setItem('laotUser', JSON.stringify(d.user));
};
const clearSession = () => {
  localStorage.removeItem('laotToken');
  localStorage.removeItem('laotUser');
};
const logout = () => { clearSession(); location.href = 'login.html'; };

/* ─── Format Helpers ────────────────────────────────────────── */
const rupiah = v => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(v || 0);
const shortRupiah = v => v >= 1e6 ? `Rp${(v/1e6).toFixed(1)}jt` : v >= 1e3 ? `Rp${(v/1e3).toFixed(0)}rb` : rupiah(v);
const fmtDate = d => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

/* ─── Core HTTP ─────────────────────────────────────────────── */
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res  = await fetch(API_URL + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan.');
  return data;
}

/* ─── Products ──────────────────────────────────────────────── */
async function getProducts(filters = {}) {
  try {
    const qs   = new URLSearchParams(filters).toString();
    const data = await api(`/products${qs ? '?' + qs : ''}`);
    return data.products?.length ? data.products : DEMO_PRODUCTS;
  } catch { return DEMO_PRODUCTS; }
}

async function getProduct(id) {
  try {
    const data = await api(`/products/${id}`);
    return data.product || null;
  } catch {
    return DEMO_PRODUCTS.find(p => String(p.id) === String(id)) || DEMO_PRODUCTS[0];
  }
}

async function addProduct(formData)         { return api('/products', { method:'POST', body:formData }); }
async function updateProduct(id, formData)  { return api(`/products/${id}`, { method:'PUT', body:formData }); }
async function deleteProduct(id)            { return api(`/products/${id}`, { method:'DELETE' }); }

/* ─── Seller ─────────────────────────────────────────────────── */
async function getSellerProfile(sellerId) {
  try {
    const data = await api(`/products/seller/${sellerId}`);
    return { seller: data.seller, products: data.products };
  } catch {
    const seller   = DEMO_SELLERS.find(s => String(s.id) === String(sellerId)) || DEMO_SELLERS[0];
    const products = DEMO_PRODUCTS.filter(p => String(p.seller_id) === String(sellerId));
    return { seller, products };
  }
}

/* ─── Dashboard ─────────────────────────────────────────────── */
async function getDashboard() {
  try {
    const data = await api('/products/dashboard/me');
    return data;
  } catch {
    return {
      products: DEMO_PRODUCTS,
      summary:  { product_count: DEMO_PRODUCTS.length, sold_items: 481, revenue: 8540000, orders_new: 5 }
    };
  }
}

/* ─── Orders ────────────────────────────────────────────────── */
async function createOrder(payload) {
  return api('/orders', { method:'POST', body: JSON.stringify(payload) });
}

async function getOrders() {
  try {
    const data = await api('/orders/me');
    return data.orders || DEMO_ORDERS;
  } catch { return DEMO_ORDERS; }
}

async function getSellerOrders(status = '') {
  try {
    const qs   = status ? `?status=${status}` : '';
    const data = await api(`/orders/seller${qs}`);
    return data.orders || [];
  } catch { return []; }
}

async function updateOrderStatus(orderId, status, resi = '') {
  return api(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resi })
  });
}

/* ─── Reviews ───────────────────────────────────────────────── */
async function getProductReviews(productId) {
  try {
    const data = await api(`/reviews/product/${productId}`);
    return data.reviews || DEMO_REVIEWS.filter(r => r.product_id === productId);
  } catch {
    return DEMO_REVIEWS.filter(r => String(r.product_id) === String(productId));
  }
}

async function addReview(productId, payload) {
  return api(`/reviews/product/${productId}`, { method:'POST', body: JSON.stringify(payload) });
}

/* ─── Chat ──────────────────────────────────────────────────── */
async function getConversations() {
  try {
    const data = await api('/chat/conversations');
    return data.conversations || [];
  } catch { return []; }
}

async function getMessages(userId) {
  try {
    const data = await api(`/chat/${userId}`);
    return data.messages || [];
  } catch { return []; }
}

async function sendMessage(userId, message) {
  return api(`/chat/${userId}`, { method:'POST', body: JSON.stringify({ message }) });
}

/* ─── Auth ──────────────────────────────────────────────────── */
async function loginApi(email, password) {
  try {
    return await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
  } catch (err) {
    // Demo fallback mode
    const demoUsers = [
      { id:1, name:'Sari Pesisir',   email:'demo@umkm.com', role:'umkm',  store_name:'Dapur Laot Leupung', phone:'081234567890', address:'Leupung, Aceh Besar' },
      { id:2, name:'Pembeli Demo',   email:'demo@user.com', role:'buyer', store_name:null,                  phone:'081111222233', address:'Banda Aceh' },
      { id:3, name:'Admin Laot',     email:'admin@laot.com',role:'admin', store_name:null,                  phone:null,           address:null }
    ];
    const u = demoUsers.find(u => u.email === email);
    if (u && password === 'demo123' || password === 'admin123') {
      const demo = { token: 'demo-token-' + Date.now(), user: u };
      return demo;
    }
    throw err;
  }
}

async function registerApi(payload) {
  try {
    return await api('/auth/register', { method:'POST', body: JSON.stringify(payload) });
  } catch (err) {
    // Demo fallback
    const newUser = {
      id: Date.now(), name: payload.name, email: payload.email,
      role: payload.role || 'buyer', store_name: payload.store_name || null
    };
    return { token: 'demo-token-' + Date.now(), user: newUser };
  }
}

async function updateProfile(formData) {
  return api('/auth/me', { method:'PUT', body: formData });
}

async function changePassword(current_password, new_password) {
  return api('/auth/password', { method:'PUT', body: JSON.stringify({ current_password, new_password }) });
}

/* ─── AI ────────────────────────────────────────────────────── */
async function askNiagaAI(prompt) {
  try {
    const res = await fetch(`${API_URL}/ai`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ prompt })
    });
    const d = await res.json().catch(() => ({}));
    return d.reply || d.result || generateFallbackReply(prompt);
  } catch {
    return generateFallbackReply(prompt);
  }
}

function generateFallbackReply(prompt = '') {
  const p = prompt.toLowerCase();
  if (p.includes('nama') || p.includes('merek') || p.includes('brand'))
    return `✨ **Ide Nama Merek untuk Produk Anda:**\n\n🐟 Laot Rasa Premium\n🌊 Pesisir Sejati\n⚓ Bahari Select\n🦐 Meutuah Aceh\n\n**Tips memilih nama merek UMKM:**\n• Mudah diingat dan dieja\n• Mencerminkan asal daerah\n• Ada unsur laut/maritim\n• Bisa di-hashtag Instagram`;
  if (p.includes('slogan') || p.includes('tagline'))
    return `🎯 **Pilihan Slogan untuk Produk Laut Anda:**\n\n• *"Dari laut ke meja makan, dengan penuh cinta nelayan."*\n• *"Rasa laut Aceh, kualitas yang berbicara."*\n• *"Olahan pesisir tepercaya, untuk keluarga Indonesia."*\n• *"Segar dari laut, sampai ke pintu rumah Anda."*`;
  if (p.includes('deskripsi') || p.includes('caption') || p.includes('ig') || p.includes('instagram'))
    return `📝 **Caption Instagram yang Menarik:**\n\n🌊 *"Rasa laut yang sesungguhnya! Dibuat langsung dari nelayan lokal Aceh dengan teknik tradisional higienis.*\n\n✨ Tanpa pengawet. Tanpa pewarna. 100% alami.\n\nPesan sekarang sebelum stok habis! Link di bio 👆\n\n#LaotNiaga #ProdukLautAceh #UMKM #MakananHalal #OlehOlehAceh"*`;
  if (p.includes('harga') || p.includes('strategi') || p.includes('jual'))
    return `💡 **Strategi Harga untuk UMKM Laut:**\n\n📊 Harga Kompetitif:\n• Riset harga pasar lokal dan marketplace\n• Tambahkan 20-30% margin untuk kemasan premium\n• Buat paket bundle (lebih hemat = lebih laku)\n\n🎁 Tips meningkatkan penjualan:\n• Foto produk profesional (gunakan background putih/biru)\n• Aktif di TikTok dan Reels Instagram\n• Berikan teaser konten proses produksi\n• Kumpulkan testimoni pembeli untuk kepercayaan`;
  return `Halo! Saya **NiagaAI** 🤖 — asisten branding UMKM hasil laut Aceh.\n\nSaya bisa membantu Anda dengan:\n• 🏷️ **Nama merek** yang menarik\n• 💬 **Slogan** yang mudah diingat\n• 📝 **Deskripsi produk** profesional\n• 📸 **Caption Instagram** yang viral\n• 💰 **Strategi harga dan pemasaran**\n\nCoba ketik: *"Buatkan nama merek untuk produk keumamah saya"*`;
}

/* ─── Image Helper ──────────────────────────────────────────── */
function productImage(product) {
  if (!product) return 'assets/img/keumamah.jpg';
  if (!product.image) return 'assets/img/keumamah.jpg';
  if (product.image.startsWith('/uploads')) return UPLOAD_URL + product.image;
  return product.image;
}

/* ─── Stars Helper ──────────────────────────────────────────── */
function starsHtml(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += i <= Math.round(rating)
      ? '<span class="star">★</span>'
      : '<span style="color:var(--line-strong,#ddd)">★</span>';
  }
  return html;
}