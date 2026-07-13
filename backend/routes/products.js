const express = require("express");
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

const router = express.Router();

// Gunakan MemoryStorage untuk upload ke Cloud (ImgBB)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
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
