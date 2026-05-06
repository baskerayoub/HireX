const { candidate, profile, project, meeting, ai_analysis } = require("../models");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

// Apply as candidate (public endpoint - accepts CV upload)
exports.apply = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { name, email, phone, location, education, currentPosition } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    // Verify profile exists
    const prof = await profile.findByPk(profileId);
    if (!prof) {
      return res.status(404).json({ error: "Job position not found" });
    }

    // Check for duplicate application
    if (email) {
      const existing = await candidate.findOne({
        where: { fk_profile: profileId, email: email.toLowerCase() },
      });
      if (existing) {
        return res.status(409).json({ error: "You have already applied for this position" });
      }
    }

    const cvPath = req.file ? req.file.filename : null;

    const newCandidate = await candidate.create({
      fk_profile: profileId,
      name: name || null,
      email: email ? email.toLowerCase() : null,
      phone: phone || null,
      location: location || null,
      education: education || null,
      current_position: currentPosition || null,
      cv_s3_path: cvPath || "no-cv",
      type_importation: "platforme",
      status: "received",
      creation_date: new Date(),
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      candidate: {
        id: newCandidate.id,
        name: newCandidate.name,
        status: newCandidate.status,
      },
    });
  } catch (error) {
    console.error("Apply error:", error);
    return res.status(500).json({ error: "Failed to submit application" });
  }
};

// Recruiter generates a unique link for a candidate
exports.generateLink = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { name, email, phone, location, education, currentPosition } = req.body;

    // Verify profile exists
    const prof = await profile.findByPk(profileId);
    if (!prof) {
      return res.status(404).json({ error: "Job position not found" });
    }

    // Check for duplicate application
    if (email) {
      const existing = await candidate.findOne({
        where: { fk_profile: profileId, email: email.toLowerCase() },
      });
      if (existing) {
        return res.status(409).json({ error: "Candidate already exists for this position" });
      }
    }

    const { v4: uuidv4 } = require('uuid');
    const token = uuidv4();

    const newCandidate = await candidate.create({
      fk_profile: profileId,
      name: name || null,
      email: email ? email.toLowerCase() : null,
      phone: phone || null,
      location: location || null,
      education: education || null,
      current_position: currentPosition || null,
      cv_s3_path: null,
      type_importation: "platforme",
      status: "received",
      creation_date: new Date(),
      upload_token: token,
    });

    const uploadLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upload/${token}`;

    return res.status(201).json({
      message: "Candidate created and link generated successfully",
      uploadLink,
      candidate: {
        id: newCandidate.id,
        name: newCandidate.name,
        email: newCandidate.email,
        upload_token: newCandidate.upload_token,
      },
    });
  } catch (error) {
    console.error("Generate link error:", error);
    return res.status(500).json({ error: "Failed to generate link" });
  }
};

// Candidate uploads CV using their unique token
exports.uploadCvByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const cand = await candidate.findOne({ where: { upload_token: token } });
    if (!cand) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    const cvPath = req.file ? req.file.filename : null;
    if (!cvPath) {
      return res.status(400).json({ error: "No CV file provided" });
    }

    await cand.update({
      cv_s3_path: cvPath,
      upload_token: null // invalidate token after successful upload, or keep it if you allow updates
    });

    return res.json({
      message: "CV uploaded successfully",
      candidate: {
        id: cand.id,
        name: cand.name,
      },
    });
  } catch (error) {
    console.error("Upload CV by token error:", error);
    return res.status(500).json({ error: "Failed to upload CV" });
  }
};

// List candidates for a profile/job position
exports.listByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { status, search, sortBy } = req.query;

    const where = { fk_profile: profileId };
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    let order = [["creation_date", "DESC"]];
    if (sortBy === "score") {
      order = [["score_value", "DESC"]];
    } else if (sortBy === "name") {
      order = [["name", "ASC"]];
    }

    const candidates = await candidate.findAll({
      where,
      include: [
        { model: meeting, as: "Meetings" },
        { model: ai_analysis, as: "AiAnalyses" },
      ],
      order,
    });

    return res.json({ candidates });
  } catch (error) {
    console.error("List candidates error:", error);
    return res.status(500).json({ error: "Failed to list candidates" });
  }
};

// Get single candidate with full details
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const cand = await candidate.findByPk(id, {
      include: [
        { model: profile, as: "Profile", include: [{ model: project, as: "Project" }] },
        { model: meeting, as: "Meetings" },
        { model: ai_analysis, as: "AiAnalyses" },
      ],
    });

    if (!cand) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    return res.json({ candidate: cand });
  } catch (error) {
    console.error("Get candidate error:", error);
    return res.status(500).json({ error: "Failed to get candidate" });
  }
};

// Download candidate CV without exposing the uploads folder as a view link
exports.downloadCv = async (req, res) => {
  try {
    const { id } = req.params;
    const cand = await candidate.findByPk(id);

    if (!cand) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    if (!cand.cv_s3_path || cand.cv_s3_path === "no-cv") {
      return res.status(404).json({ error: "No CV uploaded for this candidate" });
    }

    const cvFilePath = path.join(__dirname, "..", "uploads", cand.cv_s3_path);
    if (!fs.existsSync(cvFilePath)) {
      return res.status(404).json({ error: "CV file not found on server" });
    }

    return res.download(cvFilePath, cand.cv_s3_path);
  } catch (error) {
    console.error("Download CV error:", error);
    return res.status(500).json({ error: "Failed to download CV" });
  }
};

// Update candidate status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const validStatuses = ["received", "selected", "validated", "Declined", "traited", "discarded"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const cand = await candidate.findByPk(id);
    if (!cand) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    await cand.update({ status: newStatus });
    return res.json({ message: "Status updated", candidate: cand });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

// Delete candidate
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const cand = await candidate.findByPk(id);

    if (!cand) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Delete CV file if exists
    if (cand.cv_s3_path && cand.cv_s3_path !== "no-cv") {
      const cvFilePath = path.join(__dirname, "..", "uploads", cand.cv_s3_path);
      if (fs.existsSync(cvFilePath)) {
        fs.unlinkSync(cvFilePath);
      }
    }

    await cand.destroy();
    return res.json({ message: "Candidate deleted" });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return res.status(500).json({ error: "Failed to delete candidate" });
  }
};

// Get candidates for a project (across all profiles)
exports.listByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const profiles = await profile.findAll({
      where: { fk_project: projectId },
      attributes: ["id"],
      raw: true,
    });

    const profileIds = profiles.map((p) => p.id);

    if (profileIds.length === 0) {
      return res.json({ candidates: [] });
    }

    const candidates_list = await candidate.findAll({
      where: { fk_profile: { [Op.in]: profileIds } },
      include: [
        { model: profile, as: "Profile", attributes: ["id", "title"] },
        { model: meeting, as: "Meetings" },
        { model: ai_analysis, as: "AiAnalyses" },
      ],
      order: [["creation_date", "DESC"]],
    });

    return res.json({ candidates: candidates_list });
  } catch (error) {
    console.error("List project candidates error:", error);
    return res.status(500).json({ error: "Failed to list candidates" });
  }
};
