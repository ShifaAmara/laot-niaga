const pool = require("../config/db");

/* ── GET REVIEWS (by product) ─────────────────────────────── */
exports.getProductReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    return res.json({ reviews: rows });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat ulasan.", error: error.message });
  }
};

/* ── ADD REVIEW ───────────────────────────────────────────── */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, order_id } = req.body;
    const product_id = req.params.id;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating harus antara 1–5." });

    // Cegah review duplikat pada order yang sama
    if (order_id) {
      const [dup] = await pool.query(
        "SELECT id FROM reviews WHERE product_id = ? AND user_id = ? AND order_id = ?",
        [product_id, req.user.id, order_id]
      );
      if (dup.length)
        return res.status(409).json({ message: "Kamu sudah memberikan ulasan untuk produk ini." });
    }

    await pool.query(
      "INSERT INTO reviews (product_id, user_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [product_id, req.user.id, order_id || null, rating, comment || null]
    );

    // Update rating rata-rata di tabel products
    const [avg] = await pool.query(
      "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ?",
      [product_id]
    );
    await pool.query(
      "UPDATE products SET rating = ? WHERE id = ?",
      [parseFloat(avg[0].avg_rating || 0).toFixed(2), product_id]
    );

    return res.status(201).json({ message: "Ulasan berhasil ditambahkan. Terima kasih!" });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menambahkan ulasan.", error: error.message });
  }
};
