const express = require("express");
const multer  = require("multer");
const path    = require("path");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post("/register",         authController.register);
router.post("/login",            authController.login);
router.get("/me",       auth(),  authController.me);
router.put("/me",       auth(), upload.single("avatar"), authController.updateProfile);
router.put("/password", auth(), authController.changePassword);

module.exports = router;
