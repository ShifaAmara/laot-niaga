const pool = require("../config/db");

/* ── CREATE ORDER ─────────────────────────────────────────── */
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, shipping_address, note, courier, payment_method } = req.body;

    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: "Keranjang pesanan tidak boleh kosong." });

    await connection.beginTransaction();
    let total = 0;
    const checkedItems = [];

    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT id, name, price, stock FROM products WHERE id = ? AND status = 'active' FOR UPDATE",
        [item.product_id]
      );
      const product  = rows[0];
      const quantity = Number(item.quantity || 1);

      if (!product)
        throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
      if (quantity < 1 || product.stock < quantity)
        throw new Error(`Stok ${product.name} tidak mencukupi (tersisa ${product.stock}).`);

      total += Number(product.price) * quantity;
      checkedItems.push({ ...product, quantity });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (buyer_id, total, shipping_address, note, courier, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, total, shipping_address || null, note || null, courier || null, payment_method || null]
    );

    for (const product of checkedItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, product.id, product.quantity, product.price]
      );
      await connection.query(
        "UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?",
        [product.quantity, product.quantity, product.id]
      );
    }

    await connection.commit();
    return res.status(201).json({
      message: "Pesanan berhasil dibuat.",
      order_id: orderResult.insertId,
      total
    });
  } catch (error) {
    await connection.rollback();
    return res.status(400).json({ message: error.message || "Gagal membuat pesanan." });
  } finally {
    connection.release();
  }
};

/* ── GET MY ORDERS (buyer) ────────────────────────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id',       oi.id,
                  'name',     p.name,
                  'image',    p.image,
                  'qty',      oi.quantity,
                  'price',    oi.price
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products   p   ON p.id = oi.product_id
       WHERE o.buyer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Parse JSON_ARRAYAGG string jika perlu
    const parsed = orders.map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items
    }));

    return res.json({ orders: parsed });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesanan.", error: error.message });
  }
};

/* ── GET SELLER ORDERS ────────────────────────────────────── */
exports.getSellerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = ["p.seller_id = ?"];
    const values = [req.user.id];
    if (status) { where.push("o.status = ?"); values.push(status); }

    const [orders] = await pool.query(
      `SELECT o.id, o.status, o.total, o.shipping_address, o.courier, o.resi,
              o.created_at, buyer.name AS buyer_name, buyer.phone AS buyer_phone,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'name',  p.name,
                  'image', p.image,
                  'qty',   oi.quantity,
                  'price', oi.price
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p     ON p.id = oi.product_id
       JOIN users buyer    ON buyer.id = o.buyer_id
       WHERE ${where.join(" AND ")}
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      values
    );

    const parsed = orders.map(o => ({
      ...o,
      items: typeof o.items === "string" ? JSON.parse(o.items) : o.items
    }));

    return res.json({ orders: parsed });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesanan UMKM.", error: error.message });
  }
};

/* ── UPDATE ORDER STATUS ──────────────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const allowed = ["pending","paid","processed","shipped","completed","cancelled"];
    const { status, resi } = req.body;

    if (!allowed.includes(status))
      return res.status(400).json({ message: "Status pesanan tidak valid." });

    // Pastikan order milik seller ini
    const [rows] = await pool.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p     ON p.id = oi.product_id
       WHERE o.id = ? AND p.seller_id = ?
       LIMIT 1`,
      [req.params.id, req.user.id]
    );

    if (!rows.length && req.user.role !== "admin")
      return res.status(403).json({ message: "Pesanan ini tidak terkait toko Anda." });

    const updateFields = ["status = ?"];
    const updateValues = [status];
    if (resi) { updateFields.push("resi = ?"); updateValues.push(resi); }
    updateValues.push(req.params.id);

    await pool.query(`UPDATE orders SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);
    return res.json({ message: "Status pesanan berhasil diperbarui." });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memperbarui status pesanan.", error: error.message });
  }
};

/* ── GET ORDER DETAIL ─────────────────────────────────────── */
exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, buyer.name AS buyer_name, buyer.phone AS buyer_phone
       FROM orders o
       JOIN users buyer ON buyer.id = o.buyer_id
       WHERE o.id = ? AND (o.buyer_id = ? OR ? = 'admin')`,
      [req.params.id, req.user.id, req.user.role]
    );

    if (!orders.length)
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    return res.json({ order: { ...orders[0], items } });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat detail pesanan.", error: error.message });
  }
};
