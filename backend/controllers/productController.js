const pool = require("../config/db");
const { uploadToImgBB } = require("../utils/imgbb");

// Helper if fallback local upload is still somehow used, though unlikely with memory storage
function productImagePath(file) {
  return file ? `/uploads/${file.originalname}` : null; // Won't be saved here anymore, just fallback
}

exports.getProducts = async (req, res) => {
  try {
    const { q = "", category = "", seller_id = "", limit = 30 } = req.query;
    const values = [];
    const where = ["p.status = 'active'"];

    if (q) {
      where.push("(p.name LIKE ? OR p.description LIKE ? OR u.store_name LIKE ?)");
      values.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (category) {
      where.push("p.category = ?");
      values.push(category);
    }

    if (seller_id) {
      where.push("p.seller_id = ?");
      values.push(seller_id);
    }

    values.push(Math.min(Number(limit) || 30, 100));

    const [rows] = await pool.query(
      `SELECT p.*, u.name AS seller_name, u.store_name, u.address AS seller_address
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE ${where.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT ?`,
      values
    );

    return res.json({ products: rows });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat produk.", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS seller_name, u.store_name, u.phone AS seller_phone,
              u.address AS seller_address, u.story AS seller_story
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    return res.json({ product: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat detail produk.", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      unit = "pcs",
      description,
      origin,
      ingredients,
      production_method,
      expiry_info
    } = req.body;

    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: "Nama, kategori, harga, dan stok wajib diisi." });
    }

    let imageUrl = null;
    if (req.file) {
      // Upload ke ImgBB
      imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
    }

    const [result] = await pool.query(
      `INSERT INTO products
       (seller_id, name, category, price, stock, unit, description, origin, ingredients, production_method, expiry_info, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        category,
        price,
        stock,
        unit,
        description || null,
        origin || null,
        ingredients || null,
        production_method || null,
        expiry_info || null,
        imageUrl
      ]
    );

    return res.status(201).json({ message: "Produk berhasil ditambahkan.", id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menambahkan produk.", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    const product = existing[0];

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (product.seller_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Produk ini bukan milik akun Anda." });
    }

    const fields = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      unit: req.body.unit,
      description: req.body.description,
      origin: req.body.origin,
      ingredients: req.body.ingredients,
      production_method: req.body.production_method,
      expiry_info: req.body.expiry_info,
      status: req.body.status
    };

    if (req.file) {
       // Upload ke ImgBB
      const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
      if(imageUrl) {
        fields.image = imageUrl;
      }
    }

    const setClauses = [];
    const values = [];
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (!setClauses.length) {
      return res.json({ message: "Tidak ada perubahan produk." });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE products SET ${setClauses.join(", ")} WHERE id = ?`, values);

    return res.json({ message: "Produk berhasil diperbarui." });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memperbarui produk.", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT seller_id FROM products WHERE id = ?", [req.params.id]);
    const product = existing[0];

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (product.seller_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Produk ini bukan milik akun Anda." });
    }

    await pool.query("UPDATE products SET status = 'archived' WHERE id = ?", [req.params.id]);
    return res.json({ message: "Produk berhasil diarsipkan." });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menghapus produk.", error: error.message });
  }
};

exports.getSellerProfile = async (req, res) => {
  try {
    const [sellerRows] = await pool.query(
      "SELECT id, name, store_name, phone, address, story, created_at FROM users WHERE id = ? AND role IN ('umkm', 'admin')",
      [req.params.id]
    );

    if (!sellerRows.length) {
      return res.status(404).json({ message: "Profil UMKM tidak ditemukan." });
    }

    const [products] = await pool.query(
      "SELECT * FROM products WHERE seller_id = ? AND status = 'active' ORDER BY created_at DESC",
      [req.params.id]
    );

    return res.json({ seller: sellerRows[0], products });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat profil UMKM.", error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [products] = await pool.query(
      "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    const [summaryRows] = await pool.query(
      `SELECT
         COUNT(DISTINCT p.id) AS product_count,
         COALESCE(SUM(oi.quantity), 0) AS sold_items,
         COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
       WHERE p.seller_id = ?`,
      [req.user.id]
    );

    return res.json({ summary: summaryRows[0], products });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat dashboard UMKM.", error: error.message });
  }
};
