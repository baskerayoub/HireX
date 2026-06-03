const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public route — candidates apply here (no auth needed)
router.post("/apply/:profileId", upload.single("cv"), candidateController.apply);

// Public route — candidates upload CV using generated link
router.post("/upload/:token", upload.single("cv"), candidateController.uploadCvByToken);

// Protected routes
router.use(authenticate);
router.post("/profile/:profileId/generate-link", candidateController.generateLink);
router.get("/profile/:profileId", candidateController.listByProfile);
router.get("/project/:projectId", candidateController.listByProject);
router.get("/:id/cv/download", candidateController.downloadCv);
router.get("/:id", candidateController.getById);
router.patch("/:id/status", candidateController.updateStatus);
router.patch("/:id/hire", candidateController.hireCandidate);
router.delete("/:id", candidateController.delete);

module.exports = router;
