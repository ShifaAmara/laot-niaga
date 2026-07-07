const express = require("express");
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar."));
    }
    return cb(null, true);
  }
});

router.get("/", productController.getProducts);
router.get("/dashboard/me", auth(["umkm", "admin"]), productController.getDashboard);
router.get("/seller/:id", productController.getSellerProfile);
router.get("/:id", productController.getProductById);
router.post("/", auth(["umkm", "admin"]), upload.single("image"), productController.createProduct);
router.put("/:id", auth(["umkm", "admin"]), upload.single("image"), productController.updateProduct);
router.delete("/:id", auth(["umkm", "admin"]), productController.deleteProduct);

module.exports = router;
