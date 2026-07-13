/* ============================================================
   LAOT NIAGA — MAIN.JS v2 | Legacy compat (kept minimal)
   Semua logika utama sudah dipindah ke masing-masing halaman.
   File ini hanya menyimpan fungsi helper lama agar tidak break.
   ============================================================ */

// Alias untuk kompatibilitas dengan kode lama
const login        = (email, password) => loginApi(email, password);
const register     = payload => registerApi(payload);
const saveSession  = d => { localStorage.setItem('laotToken', d.token); localStorage.setItem('laotUser', JSON.stringify(d.user)); };
