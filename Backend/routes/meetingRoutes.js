const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/", meetingController.create);
router.get("/all", meetingController.listAll);
router.get("/candidate/:candidateId", meetingController.listByCandidate);
router.get("/project/:projectId", meetingController.listByProject);
router.put("/:id", meetingController.update);
router.patch("/:id/cancel", meetingController.cancel);
router.delete("/:id", meetingController.delete);

module.exports = router;
