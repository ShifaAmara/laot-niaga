const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/reviews/product/:id  → Ulasan produk
router.get("/product/:id", reviewController.getProductReviews);

// POST /api/reviews/product/:id → Tambah ulasan (harus login)
router.post("/product/:id", auth(), reviewController.addReview);

module.exports = router;
