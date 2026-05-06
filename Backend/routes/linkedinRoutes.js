const express = require("express");
const router = express.Router();
const linkedinController = require("../controllers/linkedinController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/auth-url", linkedinController.getAuthUrl);
router.get("/callback", linkedinController.callback);
router.get("/status", linkedinController.status);
router.post("/publish", linkedinController.publishJob);
router.delete("/disconnect", linkedinController.disconnect);

module.exports = router;
