# Laot Niaga

Laot Niaga adalah contoh project full-stack marketplace produk olahan hasil laut Aceh. Project ini dibuat sesuai proposal: ada marketplace, profil UMKM, dashboard kelola produk, transaksi sederhana, autentikasi, upload gambar, dan NiagaAI untuk rekomendasi branding.

## Struktur

```text
laot-niaga/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── models/schema.sql
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend-bootstrap/
│   ├── index.html
│   ├── marketplace.html
│   ├── product-detail.html
│   ├── dashboard-umkm.html
│   ├── niaga-ai.html
│   ├── profil-umkm.html
│   ├── login.html
│   ├── register.html
│   ├── assets/
│   └── js/main.js
└── frontend-custom/
    └── halaman yang sama, tetapi memakai CSS custom tanpa Bootstrap
```

## Cara Menjalankan Backend

1. Masuk ke folder backend.

```bash
cd backend
```

2. Install dependency.

```bash
npm install
```

Jika PowerShell menolak `npm` karena execution policy, jalankan:

```bash
npm.cmd install
```

3. Buat database MySQL dengan file:

```text
backend/models/schema.sql
```

Di phpMyAdmin, buka tab SQL, paste isi file tersebut, lalu jalankan.

4. Sesuaikan konfigurasi di `.env`.

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=laot_niaga
JWT_SECRET=laot_niaga_secret_ganti_saat_produksi
GEMINI_KEY=
FRONTEND_ORIGIN=http://localhost:5500
```

5. Jalankan server.

```bash
npm run dev
```

atau:

```bash
npm start
```

Di PowerShell yang memblokir script, gunakan:

```bash
npm.cmd run dev
```

API akan berjalan di:

```text
http://localhost:5000
```

## Cara Membuka Frontend

Pilih salah satu versi:

- `frontend-bootstrap/index.html`
- `frontend-custom/index.html`

Untuk hasil terbaik, buka dengan Live Server di VS Code. Kalau backend belum berjalan, frontend tetap menampilkan data demo.

## Akun Demo

Password untuk akun demo:

```text
password123
```

UMKM:

```text
umkm@laotniaga.test
```

Pembeli:

```text
buyer@laotniaga.test
```

## Fitur

- Register dan login pembeli atau UMKM.
- JWT untuk proteksi route backend.
- CRUD produk UMKM dengan upload gambar.
- Marketplace dengan pencarian dan filter kategori.
- Detail produk dengan transparansi bahan, asal, stok, proses, dan masa simpan.
- Profil UMKM sebagai etalase toko digital.
- Pesanan sederhana dengan pengurangan stok.
- Dashboard UMKM berisi ringkasan produk, penjualan, dan omzet.
- NiagaAI untuk ide nama merek, slogan, deskripsi produk, dan profil usaha.

## Catatan NiagaAI

Jika `GEMINI_KEY` kosong, backend memakai fallback lokal sehingga fitur tetap bisa dicoba. Jika ingin memakai Google Gemini, isi `GEMINI_KEY` di file `.env`.

## Endpoint Utama

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/orders
GET    /api/orders/me
GET    /api/orders/seller
PATCH  /api/orders/:id/status
POST   /api/ai/branding
```

## Responsif

Kedua frontend dibuat responsif untuk desktop, tablet, dan HP:

- Desktop: grid produk 3 kolom.
- Tablet: layout menyesuaikan lebar layar.
- HP: layout turun menjadi 1 kolom, tombol dan input lebih mudah disentuh.
