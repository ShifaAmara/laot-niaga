const pool = require("../config/db");

/* ── GET CONVERSATIONS LIST ───────────────────────────────── */
exports.getConversations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.id, u.name, u.store_name, u.avatar, u.role,
        (SELECT c2.message FROM chats c2
         WHERE (c2.sender_id = ? AND c2.receiver_id = u.id)
            OR (c2.sender_id = u.id AND c2.receiver_id = ?)
         ORDER BY c2.created_at DESC LIMIT 1) AS last_message,
        (SELECT c3.created_at FROM chats c3
         WHERE (c3.sender_id = ? AND c3.receiver_id = u.id)
            OR (c3.sender_id = u.id AND c3.receiver_id = ?)
         ORDER BY c3.created_at DESC LIMIT 1) AS last_time,
        (SELECT COUNT(*) FROM chats c4
         WHERE c4.sender_id = u.id AND c4.receiver_id = ? AND c4.is_read = 0) AS unread
       FROM users u
       WHERE u.id != ?
         AND EXISTS (
           SELECT 1 FROM chats c
           WHERE (c.sender_id = ? AND c.receiver_id = u.id)
              OR (c.sender_id = u.id AND c.receiver_id = ?)
         )
       ORDER BY last_time DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );
    return res.json({ conversations: rows });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat percakapan.", error: error.message });
  }
};

/* ── GET MESSAGES (with a specific user) ─────────────────── */
exports.getMessages = async (req, res) => {
  try {
    const other_id = req.params.userId;
    const [rows] = await pool.query(
      `SELECT c.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM chats c
       JOIN users u ON u.id = c.sender_id
       WHERE (c.sender_id = ? AND c.receiver_id = ?)
          OR (c.sender_id = ? AND c.receiver_id = ?)
       ORDER BY c.created_at ASC`,
      [req.user.id, other_id, other_id, req.user.id]
    );

    // Mark as read
    await pool.query(
      "UPDATE chats SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0",
      [other_id, req.user.id]
    );

    return res.json({ messages: rows });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat pesan.", error: error.message });
  }
};

/* ── SEND MESSAGE ─────────────────────────────────────────── */
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiver_id = req.params.userId;

    if (!message || !message.trim())
      return res.status(400).json({ message: "Pesan tidak boleh kosong." });

    // Pastikan receiver exists
    const [target] = await pool.query("SELECT id FROM users WHERE id = ?", [receiver_id]);
    if (!target.length)
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });

    const [result] = await pool.query(
      "INSERT INTO chats (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [req.user.id, receiver_id, message.trim()]
    );

    return res.status(201).json({
      message: "Pesan terkirim.",
      chat: {
        id: result.insertId,
        sender_id: req.user.id,
        receiver_id,
        message: message.trim(),
        created_at: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengirim pesan.", error: error.message });
  }
};
