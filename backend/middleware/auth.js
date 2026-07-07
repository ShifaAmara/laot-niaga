const jwt = require("jsonwebtoken");

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan. Silakan login." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Akses ditolak untuk peran akun ini." });
      }

      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
    }
  };
}

module.exports = auth;
