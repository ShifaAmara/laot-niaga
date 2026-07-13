const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const authRoutes    = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes   = require("./routes/orders");
const aiRoutes      = require("./routes/ai");
const reviewRoutes  = require("./routes/reviews");
const chatRoutes    = require("./routes/chat");

const app  = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*").split(",").map(o => o.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin))
      return callback(null, true);
    return callback(new Error("Origin tidak diizinkan oleh CORS."));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Health check ── */
app.get("/", (_req, res) => res.json({
  name: "Laot Niaga API v2",
  status: "online",
  endpoints: ["/api/auth", "/api/products", "/api/orders", "/api/reviews", "/api/chat", "/api/ai"]
}));

/* ── Routes ── */
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/chat",     chatRoutes);
app.use("/api/ai",       aiRoutes);

/* ── Error handler ── */
app.use((err, _req, res, _next) => {
  console.error("[Laot Niaga API Error]", err.message);
  res.status(err.status || 400).json({ message: err.message || "Terjadi kesalahan pada server." });
});

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`\n🌊 Laot Niaga API v2 berjalan di http://localhost:${port}`);
    console.log(`   Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`   DB  : ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);
  });
}

module.exports = app;