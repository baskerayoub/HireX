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

exports.listAll = async (req, res) => {
  try {
    const meetings_list = await meeting.findAll({
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
    const mtg = await meeting.findByPk(req.params.id, {
      include: [{ model: candidate, as: "Candidate", attributes: ["id", "name", "email"] }],
    });
    if (!mtg) return res.status(404).json({ error: "Meeting not found" });

    // Send cancellation email if requested
    if (req.body.sendEmail && mtg.Candidate?.email) {
      try {
        const s = new Date(mtg.start_date);
        await emailService.sendNotification({
          to: mtg.Candidate.email,
          subject: `Interview Cancelled: ${mtg.subject || "Interview"}`,
          message: `Dear ${mtg.Candidate.name || "Candidate"},<br><br>We regret to inform you that your interview <strong>"${mtg.subject || "Interview"}"</strong> scheduled for <strong>${s.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> at <strong>${s.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</strong> has been cancelled.<br><br>We apologize for any inconvenience. Our recruitment team will be in touch if there are any updates regarding your application.<br><br>Best regards,<br><strong>The HireX Team</strong>`,
        });
        await mtg.update({ status: "Cancelled", status_message: "Cancelled — email sent" });
      } catch (emailErr) {
        await mtg.update({ status: "Cancelled", status_message: "Cancelled — email failed: " + emailErr.message });
      }
    } else {
      await mtg.update({ status: "Cancelled" });
    }

    return res.json({ message: "Meeting cancelled" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel meeting" });
  }
};

exports.delete = async (req, res) => {
  try {
    const mtg = await meeting.findByPk(req.params.id, {
      include: [{ model: candidate, as: "Candidate", attributes: ["id", "name", "email"] }],
    });
    if (!mtg) return res.status(404).json({ error: "Meeting not found" });

    // Send cancellation email if requested
    if (req.body.sendEmail && mtg.Candidate?.email) {
      try {
        const s = new Date(mtg.start_date);
        await emailService.sendNotification({
          to: mtg.Candidate.email,
          subject: `Interview Cancelled: ${mtg.subject || "Interview"}`,
          message: `Dear ${mtg.Candidate.name || "Candidate"},<br><br>We regret to inform you that your interview <strong>"${mtg.subject || "Interview"}"</strong> scheduled for <strong>${s.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> at <strong>${s.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</strong> has been cancelled.<br><br>We apologize for any inconvenience. Our recruitment team will be in touch if there are any updates regarding your application.<br><br>Best regards,<br><strong>The HireX Team</strong>`,
        });
      } catch (emailErr) {
        console.error("Cancellation email failed:", emailErr.message);
      }
    }

    // Delete associated feedback first
    await feedback.destroy({ where: { fk_meeting: mtg.id } });
    await mtg.destroy();

    return res.json({ message: "Meeting deleted" });
  } catch (error) {
    console.error("Delete meeting error:", error);
    return res.status(500).json({ error: "Failed to delete meeting" });
  }
};
