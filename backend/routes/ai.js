const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");

// Structured branding generator (with auth if available)
router.post("/branding", auth([]), aiController.generateBranding);

// General AI chat endpoint
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt wajib diisi." });
    }

    // Try Gemini API if available
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "ISI_API_KEY_KAMU") {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(`
Kamu adalah NIAGA AI.
Kamu membantu UMKM hasil laut Aceh.

Tugasmu:
- Membuat nama produk
- Membuat slogan
- Membuat deskripsi produk
- Membuat caption Instagram
- Memberikan ide branding
- Memberikan ide logo
- Memberikan strategi pemasaran

Jawab menggunakan Bahasa Indonesia yang profesional.

Pertanyaan:
${prompt}
      `);

      const text = result.response.text();
      return res.json({ success: true, reply: text });
    }

    // Fallback response if no API key
    return res.json({
      success: true,
      reply: `Terima kasih atas pertanyaan Anda tentang "${prompt.slice(0, 50)}..."

Berikut saran dari NiagaAI:

✨ **Nama Merek**: Pesisir Rasa, Laot Premium, Mutiara Bahari
💬 **Slogan**: "Rasa laut Aceh, sampai ke meja keluarga."
📝 **Deskripsi**: Produk olahan hasil laut berkualitas dari pesisir Aceh, diolah dengan standar kebersihan tinggi dan bumbu tradisional.

💡 *Catatan: Aktifkan Gemini API key untuk mendapat rekomendasi AI yang lebih personal.*`
    });
  } catch (err) {
    console.error("=== GEMINI ERROR ===", err.message);
    return res.status(500).json({
      success: false,
      message: "NiagaAI gagal memproses permintaan.",
      reply: "Maaf, terjadi kendala teknis. Silakan coba lagi nanti."
    });
  }
});

module.exports = router;