const { meeting, candidate, users, profile, feedback } = require("../models");
const emailService = require("../services/emailService");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const { fk_candidate, type, subject, content, start_date, end_date, other_participants, platform, link } = req.body;
    if (!fk_candidate || !start_date || !end_date || !content) {
      return res.status(400).json({ error: "Candidate, dates, and content are required" });
    }
    const cand = await candidate.findByPk(fk_candidate, { include: [{ model: profile, as: "Profile" }] });
    if (!cand) return res.status(404).json({ error: "Candidate not found" });

    const newMeeting = await meeting.create({
      fk_candidate, fk_user: req.user.id, type: type || "Interview",
      subject: subject || `Interview - ${cand.name || "Candidate"}`, content,
      start_date: new Date(start_date), end_date: new Date(end_date),
      other_participants: other_participants || "", status: "Created",
      platform: platform || "Google Meet", link: link || null,
    });

    if (cand.email) {
      try {
        const s = new Date(start_date), e = new Date(end_date);
        await emailService.sendInterviewInvitation({
          to: cand.email, candidateName: cand.name || "Candidate",
          jobTitle: cand.Profile?.title || "Position", date: s.toISOString().split("T")[0],
          startTime: s.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          endTime: e.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          meetingLink: link, interviewerName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "HR Team",
          notes: content,
        });
        await newMeeting.update({ status_message: "Email sent" });
      } catch (emailErr) {
        await newMeeting.update({ status_message: "Email failed: " + emailErr.message });
      }
    }
    return res.status(201).json({ message: "Interview scheduled", meeting: newMeeting });
  } catch (error) {
    console.error("Create meeting error:", error);
    return res.status(500).json({ error: "Failed to schedule interview" });
  }
};

exports.listByCandidate = async (req, res) => {
  try {
    const meetings = await meeting.findAll({
      where: { fk_candidate: req.params.candidateId },
      include: [
        { model: users, as: "User", attributes: ["id", "firstName", "lastName", "email"] },
        { model: feedback, as: "Feedback" },
      ],
      order: [["start_date", "DESC"]],
    });
    return res.json({ meetings });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list meetings" });
  }
};

exports.listByProject = async (req, res) => {
  try {
    const profiles_list = await profile.findAll({ where: { fk_project: req.params.projectId }, attributes: ["id"], raw: true });
    const pIds = profiles_list.map(p => p.id);
    if (!pIds.length) return res.json({ meetings: [] });
    const cands = await candidate.findAll({ where: { fk_profile: { [Op.in]: pIds } }, attributes: ["id"], raw: true });
    const cIds = cands.map(c => c.id);
    if (!cIds.length) return res.json({ meetings: [] });
    const meetings_list = await meeting.findAll({
      where: { fk_candidate: { [Op.in]: cIds } },
      include: [
        { model: candidate, as: "Candidate", attributes: ["id", "name", "email"] },
        { model: users, as: "User", attributes: ["id", "firstName", "lastName"] },
        { model: feedback, as: "Feedback" },
      ],
      order: [["start_date", "DESC"]],
    });
    return res.json({ meetings: meetings_list });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list meetings" });
  }
};

exports.update = async (req, res) => {
  try {
    const mtg = await meeting.findByPk(req.params.id);
    if (!mtg) return res.status(404).json({ error: "Meeting not found" });
    await mtg.update({ ...req.body, status: "Updated" });
    return res.json({ message: "Meeting updated", meeting: mtg });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update meeting" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const mtg = await meeting.findByPk(req.params.id);
    if (!mtg) return res.status(404).json({ error: "Meeting not found" });
    await mtg.update({ status: "Cancelled" });
    return res.json({ message: "Meeting cancelled" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel meeting" });
  }
};
