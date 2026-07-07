const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const aiRoutes = require("./routes/ai");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin frontend tidak diizinkan oleh CORS."));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.json({
    name: "Laot Niaga API",
    status: "online",
    endpoints: ["/api/auth", "/api/products", "/api/orders", "/api/ai"]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  res.status(400).json({ message: err.message || "Terjadi kesalahan pada server." });
});

app.listen(port, () => {
  console.log(`Laot Niaga API berjalan di http://localhost:${port}`);
});

const aiRoute = require("./routes/ai");
app.use("/api/ai", aiRoute);