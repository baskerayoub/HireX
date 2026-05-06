const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/project/:projectId", profileController.create);
router.get("/project/:projectId", profileController.listByProject);
router.get("/:id", profileController.getById);
router.put("/:id", profileController.update);
router.delete("/:id", profileController.delete);

module.exports = router;
