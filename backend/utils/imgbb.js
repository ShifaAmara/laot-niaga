const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload gambar ke ImgBB.
 * @param {Buffer} fileBuffer - Buffer dari file gambar
 * @param {string} originalName - Nama file asli
 * @returns {Promise<string|null>} - Mengembalikan URL gambar jika sukses, atau null jika gagal.
 */
async function uploadToImgBB(fileBuffer, originalName) {
  if (!process.env.IMGBB_API_KEY) {
    console.warn("⚠️ IMGBB_API_KEY tidak ditemukan di .env");
    return null;
  }

  try {
    const form = new FormData();
    form.append('image', fileBuffer, originalName);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
      headers: form.getHeaders(),
    });

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url; // URL HTTPS langsung ke gambar
    }
    
    return null;
  } catch (error) {
    console.error("❌ Gagal upload ke ImgBB:", error.response?.data || error.message);
    return null;
  }
}

module.exports = { uploadToImgBB };
