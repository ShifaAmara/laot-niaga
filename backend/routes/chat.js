const express = require("express");
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/chat/conversations       → Daftar percakapan
router.get("/conversations",          auth(), chatController.getConversations);

// GET /api/chat/:userId             → Pesan dengan user tertentu
router.get("/:userId",                auth(), chatController.getMessages);

// POST /api/chat/:userId            → Kirim pesan ke user tertentu
router.post("/:userId",               auth(), chatController.sendMessage);

module.exports = router;
