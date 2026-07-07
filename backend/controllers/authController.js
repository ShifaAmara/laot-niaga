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

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "buyer",
      store_name,
      phone,
      address,
      story
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
    }

    if (!["buyer", "umkm", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role akun tidak valid." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, store_name, phone, address, story)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, role, store_name || null, phone || null, address || null, story || null]
    );

    const user = { id: result.insertId, name, email, role, store_name };
    return res.status(201).json({
      message: "Registrasi berhasil.",
      token: createToken(user),
      user
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal melakukan registrasi.", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    const passwordMatches = user?.password?.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : false;
    const demoPasswordMatches = process.env.NODE_ENV !== "production" && user?.password === password;

    if (!user || (!passwordMatches && !demoPasswordMatches)) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      store_name: user.store_name,
      phone: user.phone,
      address: user.address,
      story: user.story
    };

    return res.json({
      message: "Login berhasil.",
      token: createToken(safeUser),
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal login.", error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, store_name, phone, address, story, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Akun tidak ditemukan." });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat profil.", error: error.message });
  }
};
