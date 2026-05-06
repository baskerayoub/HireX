const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/", projectController.create);
router.get("/", projectController.list);
router.get("/stats", projectController.getStats);
router.get("/:id", projectController.getById);
router.put("/:id", projectController.update);
router.delete("/:id", projectController.archive);

module.exports = router;
