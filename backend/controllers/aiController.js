const pool = require("../config/db");

function fallbackIdeas({ product_name, category, origin, unique_value }) {
  const base = product_name || "Produk Laut Aceh";
  const source = origin || "pesisir Aceh";
  const strength = unique_value || "dibuat dari bahan segar pilihan";

  return {
    brand_names: [
      `${base} Laot Rasa`,
      `Pesisir ${base}`,
      `${base} Meutuah`
    ],
    slogans: [
      "Rasa laut Aceh, sampai ke meja keluarga.",
      "Olahan pesisir tepercaya untuk pasar yang lebih luas.",
      "Dari laut terbaik, untuk niaga yang berkah."
    ],
    description: `${base} adalah ${category || "produk olahan hasil laut"} dari ${source} yang ${strength}. Cocok untuk konsumen yang mencari cita rasa khas Aceh, informasi produk yang transparan, dan kualitas UMKM lokal.`,
    profile: `UMKM ini mengolah hasil laut dari ${source} dengan proses yang menjaga rasa, kebersihan, dan nilai lokal masyarakat pesisir.`
  };
}

exports.generateBranding = async (req, res) => {
  try {
    const payload = req.body || {};
    let result;

    if (process.env.GEMINI_KEY) {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
Anda adalah NiagaAI untuk marketplace Laot Niaga, platform UMKM olahan hasil laut Aceh.
Buat jawaban JSON valid dengan key brand_names, slogans, description, profile.
Data produk:
- Nama produk: ${payload.product_name || "-"}
- Kategori: ${payload.category || "-"}
- Asal: ${payload.origin || "-"}
- Keunggulan: ${payload.unique_value || "-"}
Gunakan bahasa Indonesia yang hangat, profesional, dan cocok untuk etalase toko online.
`;
      const response = await model.generateContent(prompt);
      const text = response.response.text().replace(/```json|```/g, "").trim();
      result = JSON.parse(text);
    } else {
      result = fallbackIdeas(payload);
    }

    await pool.query(
      "INSERT INTO ai_logs (user_id, prompt, response) VALUES (?, ?, ?)",
      [req.user?.id || null, JSON.stringify(payload), JSON.stringify(result)]
    );

    return res.json({ result, source: process.env.GEMINI_KEY ? "gemini" : "fallback" });
  } catch (error) {
    return res.status(500).json({
      message: "NiagaAI gagal membuat rekomendasi.",
      error: error.message,
      result: fallbackIdeas(req.body || {})
    });
  }
};
