const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/login", authController.login);
router.post("/signup", authController.signup);

// Profile update (authenticated, with optional avatar upload)
router.put("/profile", authenticate, upload.single("avatar"), authController.updateProfile);

module.exports = router;
