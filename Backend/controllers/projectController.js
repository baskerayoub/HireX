const { project, profile, users, user_project, candidate, JobOffer, JobPosting } = require("../models");
const { Op } = require("sequelize");

// Create a new recruitment project
exports.create = async (req, res) => {
  try {
    const { title, description, department, startDate, endDate, participants } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const newProject = await project.create({
      title,
      description: description || null,
      department: department || null,
      fk_user: req.user.id,
      status: "Active",
      startDate: startDate || null,
      endDate: endDate || null,
      participants: participants ? JSON.stringify(participants) : null,
      is_archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
};

// List all projects for the authenticated user
exports.list = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    
    // Non-admin users see only their projects
    if (req.user.role !== "Admin") {
      where.fk_user = req.user.id;
    }
    
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    where.is_archived = false;

    const projects = await project.findAll({
      where,
      include: [
        { model: users, as: "User", attributes: ["id", "firstName", "lastName", "email"] },
        { 
          model: profile, 
          as: "Profiles",
          include: [
            { model: candidate, as: "Candidates", attributes: ["id", "status", "score_value"] }
          ]
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ projects });
  } catch (error) {
    console.error("List projects error:", error);
    return res.status(500).json({ error: "Failed to list projects" });
  }
};

// Get a single project with full details
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const proj = await project.findByPk(id, {
      include: [
        { model: users, as: "User", attributes: ["id", "firstName", "lastName", "email"] },
        {
          model: profile,
          as: "Profiles",
          include: [
            { model: candidate, as: "Candidates" },
            { model: JobOffer, as: "JobOffer", include: [{ model: JobPosting, as: "JobPostings" }] },
          ],
        },
      ],
    });

    if (!proj) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json({ project: proj });
  } catch (error) {
    console.error("Get project error:", error);
    return res.status(500).json({ error: "Failed to get project" });
  }
};

// Update a project
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, department, status, startDate, endDate } = req.body;

    const proj = await project.findByPk(id);
    if (!proj) {
      return res.status(404).json({ error: "Project not found" });
    }

    await proj.update({
      title: title || proj.title,
      description: description !== undefined ? description : proj.description,
      department: department !== undefined ? department : proj.department,
      status: status || proj.status,
      startDate: startDate || proj.startDate,
      endDate: endDate || proj.endDate,
      updatedAt: new Date(),
    });

    return res.json({ message: "Project updated", project: proj });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ error: "Failed to update project" });
  }
};

// Archive a project (soft delete)
exports.archive = async (req, res) => {
  try {
    const { id } = req.params;
    const proj = await project.findByPk(id);

    if (!proj) {
      return res.status(404).json({ error: "Project not found" });
    }

    await proj.update({ is_archived: true, updatedAt: new Date() });
    return res.json({ message: "Project archived" });
  } catch (error) {
    console.error("Archive project error:", error);
    return res.status(500).json({ error: "Failed to archive project" });
  }
};

// Get project stats for dashboard
exports.getStats = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== "Admin") {
      where.fk_user = req.user.id;
    }

    const totalProjects = await project.count({ where: { ...where, is_archived: false } });
    const activeProjects = await project.count({ where: { ...where, status: "Active", is_archived: false } });
    
    // Count total candidates across user's projects
    const projectIds = await project.findAll({
      where: { ...where, is_archived: false },
      attributes: ["id"],
      raw: true,
    });
    const pIds = projectIds.map((p) => p.id);

    let totalCandidates = 0;
    let totalInterviews = 0;

    if (pIds.length > 0) {
      const profiles = await profile.findAll({
        where: { fk_project: { [Op.in]: pIds } },
        attributes: ["id"],
        raw: true,
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length > 0) {
        totalCandidates = await candidate.count({
          where: { fk_profile: { [Op.in]: profileIds } },
        });
      }
    }

    return res.json({
      stats: {
        totalProjects,
        activeProjects,
        totalCandidates,
        totalInterviews,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ error: "Failed to get stats" });
  }
};
