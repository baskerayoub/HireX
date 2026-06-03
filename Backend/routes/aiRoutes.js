const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

// AI-First CV Ranking — uploads file directly to OpenAI (no parsing)
router.post("/rank-cv/:candidateId", aiController.rankCV);

// Rank ALL unranked candidates in a project
router.post("/rank-all/:projectId", aiController.rankAll);

// Job description generation
router.post("/generate-description", aiController.generateDescription);

// Analytics recommendations
router.post("/recommendations", aiController.recommendations);

// LinkedIn post generation
router.post("/generate-post", aiController.generatePost);

// AI Chat assistant (HireX-scoped)
router.post("/chat", aiController.chat);

// Chat conversation persistence (history sidebar)
router.get("/conversations", aiController.listConversations);
router.get("/conversations/:id", aiController.getConversation);
router.post("/conversations", aiController.saveConversation);
router.delete("/conversations/:id", aiController.deleteConversation);

module.exports = router;
