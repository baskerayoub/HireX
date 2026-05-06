const { profile, project, skill, profile_skill, candidate, JobOffer } = require("../models");
const { Op } = require("sequelize");

// Create a profile (job position) within a project
exports.create = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title, description, location, yearsOfExperience,
      technicalSkills, softSkills, languages,
      mainMissions, education, typeContract, startDate, skills
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Profile title is required" });
    }

    // Verify project exists
    const proj = await project.findByPk(projectId);
    if (!proj) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newProfile = await profile.create({
      fk_project: projectId,
      title,
      description: description || null,
      location: location || null,
      yearsOfExperience: yearsOfExperience || null,
      technicalSkills: technicalSkills || null,
      softSkills: softSkills || null,
      languages: languages || null,
      mainMissions: mainMissions || null,
      education: education || null,
      typeContract: typeContract || null,
      startDate: startDate || null,
    });

    // Handle skills if provided (array of skill names)
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        const [sk] = await skill.findOrCreate({
          where: { name: skillName.trim().toLowerCase() },
          defaults: { name: skillName.trim().toLowerCase(), category: "technical" },
        });
        await profile_skill.create({
          profileId: newProfile.id,
          skillId: sk.id,
          importance: "required",
        });
      }
    }

    // Auto-create job offer for this profile
    await JobOffer.create({
      fk_profile: newProfile.id,
      description: description || null,
    });

    const result = await profile.findByPk(newProfile.id, {
      include: [
        { model: skill, as: "Skills", through: { attributes: ["importance"] } },
      ],
    });

    return res.status(201).json({
      message: "Profile created successfully",
      profile: result,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    return res.status(500).json({ error: "Failed to create profile", details: error.message, stack: error.stack });
  }
};

// List profiles for a project
exports.listByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const profiles = await profile.findAll({
      where: { fk_project: projectId },
      include: [
        { model: candidate, as: "Candidates", attributes: ["id", "name", "status", "score_value"] },
        { model: skill, as: "Skills", through: { attributes: ["importance"] } },
        { model: JobOffer, as: "JobOffer" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ profiles });
  } catch (error) {
    console.error("List profiles error:", error);
    return res.status(500).json({ error: "Failed to list profiles" });
  }
};

// Get single profile
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const prof = await profile.findByPk(id, {
      include: [
        { model: project, as: "Project" },
        { model: candidate, as: "Candidates" },
        { model: skill, as: "Skills", through: { attributes: ["importance"] } },
        { model: JobOffer, as: "JobOffer" },
      ],
    });

    if (!prof) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile: prof });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update profile
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prof = await profile.findByPk(id);
    if (!prof) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await prof.update(updates);

    // Update skills if provided
    if (updates.skills && Array.isArray(updates.skills)) {
      // Remove existing skill associations
      await profile_skill.destroy({ where: { profileId: id } });
      
      for (const skillName of updates.skills) {
        const [sk] = await skill.findOrCreate({
          where: { name: skillName.trim().toLowerCase() },
          defaults: { name: skillName.trim().toLowerCase(), category: "technical" },
        });
        await profile_skill.create({
          profileId: parseInt(id),
          skillId: sk.id,
          importance: "required",
        });
      }
    }

    const result = await profile.findByPk(id, {
      include: [{ model: skill, as: "Skills", through: { attributes: ["importance"] } }],
    });

    return res.json({ message: "Profile updated", profile: result });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

// Delete profile
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const prof = await profile.findByPk(id);

    if (!prof) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await profile_skill.destroy({ where: { profileId: id } });
    await prof.destroy();

    return res.json({ message: "Profile deleted" });
  } catch (error) {
    console.error("Delete profile error:", error);
    return res.status(500).json({ error: "Failed to delete profile" });
  }
};
