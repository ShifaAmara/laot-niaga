const pool = require("../config/db");

exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items, shipping_address, note } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Keranjang pesanan tidak boleh kosong." });
    }

    await connection.beginTransaction();

    let total = 0;
    const checkedItems = [];

    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT id, name, price, stock FROM products WHERE id = ? AND status = 'active' FOR UPDATE",
        [item.product_id]
      );
      const product = rows[0];
      const quantity = Number(item.quantity || 1);

      if (!product) {
        throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
      }

      if (quantity < 1 || product.stock < quantity) {
        throw new Error(`Stok ${product.name} tidak cukup.`);
      }

      total += Number(product.price) * quantity;
      checkedItems.push({ ...product, quantity });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (buyer_id, total, shipping_address, note, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.user.id, total, shipping_address || null, note || null]
    );

    for (const product of checkedItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, product.id, product.quantity, product.price]
      );
      await connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
        product.quantity,
        product.id
      ]);
    }

    await connection.commit();
    return res.status(201).json({
      message: "Pesanan berhasil dibuat.",
      order_id: orderResult.insertId,
      total
    });
  } catch (error) {
    await connection.rollback();
    return res.status(400).json({ message: "Gagal membuat pesanan.", error: error.message });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesanan.", error: error.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.buyer_id, buyer.name AS buyer_name, o.total, o.status,
              o.shipping_address, o.note, o.created_at,
              GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) SEPARATOR ', ') AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       JOIN users buyer ON buyer.id = o.buyer_id
       WHERE p.seller_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesanan UMKM.", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const allowed = ["pending", "paid", "processed", "shipped", "completed", "cancelled"];
    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status pesanan tidak valid." });
    }

    const [rows] = await pool.query(
      `SELECT o.id
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.id = ? AND p.seller_id = ?
       LIMIT 1`,
      [req.params.id, req.user.id]
    );

    if (!rows.length && req.user.role !== "admin") {
      return res.status(403).json({ message: "Pesanan ini tidak terkait toko Anda." });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    return res.json({ message: "Status pesanan berhasil diperbarui." });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memperbarui status pesanan.", error: error.message });
  }
};
