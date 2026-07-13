# 🌊 Laot Niaga — Marketplace UMKM Hasil Laut Aceh

Platform marketplace modern untuk UMKM pengolah hasil laut Aceh. Dibangun dengan desain glassmorphism premium, tampilan maritim yang elegan, dan pengalaman belanja yang intuitif.

---

## ✨ Fitur Utama

| Fitur | Status |
|-------|--------|
| Marketplace produk laut dengan filter & search | ✅ |
| Detail produk + galeri + ulasan | ✅ |
| Keranjang belanja + checkout | ✅ |
| Lacak pesanan real-time | ✅ |
| Login / Register (buyer & UMKM) | ✅ |
| Dashboard UMKM (produk, pesanan, statistik) | ✅ |
| Grafik penjualan (Chart.js) | ✅ |
| Chat pembeli–penjual | ✅ |
| Wishlist | ✅ |
| Profil toko UMKM | ✅ |
| NiagaAI — asisten branding | ✅ |
| Dark / Light mode | ✅ |
| Responsif mobile | ✅ |
| Backend REST API (Express + MySQL) | ✅ |

---

## 🗂️ Struktur Proyek

```
laot-niaga/
├── frontend-bootstrap/          # Frontend utama
│   ├── index.html               # Beranda
│   ├── marketplace.html         # Toko produk
│   ├── product-detail.html      # Detail produk
│   ├── cart.html                # Keranjang
│   ├── checkout.html            # Checkout
│   ├── orders.html              # Pesanan saya
│   ├── order-tracking.html      # Lacak pesanan
│   ├── wishlist.html            # Wishlist
│   ├── login.html               # Login
│   ├── register.html            # Daftar
│   ├── profile.html             # Profil akun
│   ├── chat.html                # Chat
│   ├── seller-profile.html      # Profil toko UMKM
│   ├── niaga-ai.html            # NiagaAI assistant
│   ├── dashboard.html           # Dashboard UMKM
│   ├── dashboard-products.html  # Kelola produk
│   ├── dashboard-orders.html    # Kelola pesanan
│   ├── 404.html                 # Halaman error
│   ├── assets/css/custom.css    # Design system lengkap
│   └── js/
│       ├── api.js               # API client + demo data
│       ├── theme.js             # Dark mode, noise, toast
│       ├── cart.js              # Keranjang + wishlist
│       ├── ai-assistant.js      # Floating AI bot
│       └── dashboard.js         # Dashboard helpers
│
└── backend/                     # Backend API
    ├── server.js                # Entry point Express
    ├── .env                     # Konfigurasi (salin dari .env.example)
    ├── config/db.js             # Koneksi MySQL
    ├── middleware/auth.js       # JWT middleware
    ├── models/schema.sql        # Skema database + seed data
    ├── routes/
    │   ├── auth.js              # /api/auth
    │   ├── products.js          # /api/products
    │   ├── orders.js            # /api/orders
    │   ├── reviews.js           # /api/reviews
    │   ├── chat.js              # /api/chat
    │   └── ai.js               # /api/ai
    └── controllers/
        ├── authController.js
        ├── productController.js
        ├── orderController.js
        ├── reviewController.js
        ├── chatController.js
        └── aiController.js
```

---

## 🚀 Cara Setup & Jalankan

### 1. Persiapan XAMPP

1. Buka **XAMPP Control Panel**
2. Start **Apache** dan **MySQL**
3. Buka **phpMyAdmin** → `http://localhost/phpmyadmin`
4. Klik **Import** → pilih file `backend/models/schema.sql`
5. Klik **Go** untuk membuat database dan data demo

### 2. Setup Backend (Node.js)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Salin file .env
copy .env.example .env
```

Edit `.env` sesuai konfigurasi XAMPP:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # kosong jika XAMPP default
DB_NAME=laot_niaga
JWT_SECRET=ganti_dengan_string_panjang_acak
GEMINI_API_KEY=       # opsional, untuk NiagaAI live
```

```bash
# Jalankan backend
npm run dev          # development (nodemon)
# atau
npm start            # production
```

Backend berjalan di: `http://localhost:5000`

### 3. Buka Frontend

**Cara 1 — Python (paling mudah):**
```bash
cd frontend-bootstrap
python -m http.server 8080
```
Buka: `http://localhost:8080`

**Cara 2 — VS Code Live Server:**
Klik kanan `index.html` → Open with Live Server

**Cara 3 — Langsung buka file:**
Buka `frontend-bootstrap/index.html` di browser
> ⚠️ Mode CORS tidak aktif saat file:// — gunakan server lokal untuk koneksi ke backend

---

## 🔑 Akun Demo

| Role | Email | Password |
|------|-------|---------|
| 👤 Pembeli | `demo@user.com` | `demo123` |
| 🏪 UMKM/Penjual | `demo@umkm.com` | `demo123` |
| 🏪 UMKM 2 | `rahmi@umkm.com` | `demo123` |
| ⚙️ Admin | `admin@laot.com` | `admin123` |

> Akun demo berfungsi **tanpa backend** — data disimpan di localStorage.

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| POST | `/register` | Daftar akun | - |
| POST | `/login` | Login | - |
| GET | `/me` | Profil saya | ✅ |
| PUT | `/me` | Update profil + avatar | ✅ |
| PUT | `/password` | Ganti password | ✅ |

### Products — `/api/products`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| GET | `/` | Daftar produk (filter: q, category, seller_id) | - |
| GET | `/:id` | Detail produk | - |
| GET | `/seller/:id` | Profil + produk toko | - |
| GET | `/dashboard/me` | Dashboard UMKM | UMKM |
| POST | `/` | Tambah produk | UMKM |
| PUT | `/:id` | Edit produk | UMKM |
| DELETE | `/:id` | Arsipkan produk | UMKM |

### Orders — `/api/orders`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| POST | `/` | Buat pesanan | Buyer |
| GET | `/me` | Pesanan saya | Buyer |
| GET | `/seller` | Pesanan toko | UMKM |
| GET | `/:id` | Detail pesanan | Auth |
| PATCH | `/:id/status` | Update status + resi | UMKM |

### Reviews — `/api/reviews`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| GET | `/product/:id` | Ulasan produk | - |
| POST | `/product/:id` | Tambah ulasan | Auth |

### Chat — `/api/chat`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| GET | `/conversations` | Daftar percakapan | Auth |
| GET | `/:userId` | Pesan dengan user | Auth |
| POST | `/:userId` | Kirim pesan | Auth |

### AI — `/api/ai`
| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| POST | `/` | Generate branding (Gemini) | - |

---

## 🎨 Design System

- **Warna:** Navy `#0c1b5e` · Ocean `#1565c0` · Yellow `#f9a825` · Teal `#00897b`
- **Font:** Inter + Plus Jakarta Sans (Google Fonts)
- **Efek:** Glassmorphism · Animated noise background · Floating orbs
- **Mode:** Dark / Light toggle (disimpan di localStorage)

---

## 🛠️ Teknologi

| Layer | Stack |
|-------|-------|
| Frontend | HTML5, Bootstrap 5, Vanilla JS, Chart.js |
| Styling | Custom CSS (1200+ baris design system) |
| Backend | Node.js, Express.js |
| Database | MySQL (XAMPP) |
| Auth | JWT (jsonwebtoken) |
| Upload | Multer |
| AI | Google Gemini API (opsional) |

---

## 📝 Catatan Penting

- Frontend berjalan **offline** dengan data demo jika backend tidak aktif
- Password di seed data menggunakan **plain text** untuk kemudahan testing — di production gunakan bcrypt
- Upload foto produk disimpan di folder `backend/uploads/`
- File `.env` **jangan di-commit** ke Git (sudah ada di `.gitignore`)

---

*Dibuat dengan ❤️ untuk UMKM pengolah hasil laut Aceh · Laot Niaga v2.0*
