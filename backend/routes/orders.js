const express = require("express");
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/",                auth(["buyer","umkm","admin"]), orderController.createOrder);
router.get("/me",               auth(["buyer","umkm","admin"]), orderController.getMyOrders);
router.get("/seller",           auth(["umkm","admin"]),         orderController.getSellerOrders);
router.get("/:id",              auth(["buyer","umkm","admin"]), orderController.getOrderById);
router.patch("/:id/status",     auth(["umkm","admin"]),         orderController.updateOrderStatus);

module.exports = router;
