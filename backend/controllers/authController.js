const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role, store_name: user.store_name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ── REGISTER ─────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "buyer", store_name, phone, address, story } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });

    if (!["buyer", "umkm", "admin"].includes(role))
      return res.status(400).json({ message: "Role akun tidak valid." });

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length)
      return res.status(409).json({ message: "Email sudah terdaftar." });

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, store_name, phone, address, story)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, role, store_name || null, phone || null, address || null, story || null]
    );

    const user = { id: result.insertId, name, email, role, store_name: store_name || null };
    return res.status(201).json({ message: "Registrasi berhasil.", token: createToken(user), user });
  } catch (error) {
    return res.status(500).json({ message: "Gagal melakukan registrasi.", error: error.message });
  }
};

/* ── LOGIN ────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email dan password wajib diisi." });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    // Support bcrypt hash AND plain-text demo passwords
    const passwordMatches = user?.password?.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : user?.password === password;

    if (!user || !passwordMatches)
      return res.status(401).json({ message: "Email atau password salah." });

    const safeUser = {
      id: user.id, name: user.name, email: user.email,
      role: user.role, store_name: user.store_name,
      phone: user.phone, address: user.address,
      story: user.story, avatar: user.avatar
    };

    return res.json({ message: "Login berhasil.", token: createToken(safeUser), user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Gagal login.", error: error.message });
  }
};

/* ── GET ME ───────────────────────────────────────────────── */
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, store_name, phone, address, story, avatar, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Akun tidak ditemukan." });
    return res.json({ user: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat profil.", error: error.message });
  }
};

/* ── UPDATE PROFILE ───────────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, story, store_name } = req.body;

    const fields = {};
    if (name)       fields.name       = name;
    if (phone)      fields.phone      = phone;
    if (address)    fields.address    = address;
    if (story)      fields.story      = story;
    if (store_name) fields.store_name = store_name;
    if (req.file)   fields.avatar     = `/uploads/${req.file.filename}`;

    if (!Object.keys(fields).length)
      return res.json({ message: "Tidak ada perubahan yang disimpan." });

    const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(", ");
    const values     = [...Object.values(fields), req.user.id];

    await pool.query(`UPDATE users SET ${setClauses} WHERE id = ?`, values);

    const [rows] = await pool.query(
      "SELECT id, name, email, role, store_name, phone, address, story, avatar FROM users WHERE id = ?",
      [req.user.id]
    );
    return res.json({ message: "Profil berhasil diperbarui.", user: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memperbarui profil.", error: error.message });
  }
};

/* ── CHANGE PASSWORD ──────────────────────────────────────── */
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
    if (new_password.length < 6)
      return res.status(400).json({ message: "Password baru minimal 6 karakter." });

    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const user = rows[0];

    const match = user?.password?.startsWith("$2")
      ? await bcrypt.compare(current_password, user.password)
      : user?.password === current_password;

    if (!match)
      return res.status(401).json({ message: "Password lama tidak cocok." });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id]);
    return res.json({ message: "Password berhasil diubah." });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengubah password.", error: error.message });
  }
};
