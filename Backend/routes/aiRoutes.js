const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/generate-description", aiController.generateDescription);
router.post("/parse-cv/:candidateId", aiController.parseCv);
router.post("/match-score/:candidateId/:profileId", aiController.matchScore);
router.post("/rank/:profileId", aiController.rankCandidates);

module.exports = router;
