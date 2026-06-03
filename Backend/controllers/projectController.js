const { project, profile, users, user_project, candidate, meeting, JobOffer, JobPosting } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

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
            { model: candidate, as: "Candidates", attributes: ["id", "name", "email", "status", "score_value", "current_position"] }
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

// Toggle project status between Active and Inactive
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const proj = await project.findByPk(id);

    if (!proj) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newStatus = proj.status === "Active" ? "Inactive" : "Active";
    await proj.update({ status: newStatus, updatedAt: new Date() });

    return res.json({ message: `Project ${newStatus === "Active" ? "activated" : "deactivated"}`, project: proj });
  } catch (error) {
    console.error("Toggle project status error:", error);
    return res.status(500).json({ error: "Failed to toggle project status" });
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

    // ── Weekly activity data (last 7 days) ──
    const weeklyApplications = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    const weeklyInterviews = [0, 0, 0, 0, 0, 0, 0];
    let positionWeekly = [];
    const weekLabels = [];

    // Calculate date range: last 7 days ending today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const previousSevenDaysAgo = new Date(sevenDaysAgo);
    previousSevenDaysAgo.setDate(previousSevenDaysAgo.getDate() - 7);
    const previousPeriodEnd = new Date(sevenDaysAgo);
    previousPeriodEnd.setMilliseconds(previousPeriodEnd.getMilliseconds() - 1);

    const currentProjects = await project.count({
      where: {
        ...where,
        is_archived: false,
        createdAt: { [Op.between]: [sevenDaysAgo, today] },
      },
    });
    const previousProjects = await project.count({
      where: {
        ...where,
        is_archived: false,
        createdAt: { [Op.between]: [previousSevenDaysAgo, previousPeriodEnd] },
      },
    });
    const currentActiveProjects = await project.count({
      where: {
        ...where,
        status: "Active",
        is_archived: false,
        createdAt: { [Op.between]: [sevenDaysAgo, today] },
      },
    });
    const previousActiveProjects = await project.count({
      where: {
        ...where,
        status: "Active",
        is_archived: false,
        createdAt: { [Op.between]: [previousSevenDaysAgo, previousPeriodEnd] },
      },
    });
    let currentCandidates = 0;
    let previousCandidates = 0;

    // Build labels for the last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      weekLabels.push(dayNames[d.getDay()]);
    }

    if (pIds.length > 0) {
      const profiles = await profile.findAll({
        where: { fk_project: { [Op.in]: pIds } },
        attributes: ["id", "title"],
        raw: true,
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length > 0) {
        totalCandidates = await candidate.count({
          where: { fk_profile: { [Op.in]: profileIds } },
        });
        currentCandidates = await candidate.count({
          where: {
            fk_profile: { [Op.in]: profileIds },
            created_at: { [Op.between]: [sevenDaysAgo, today] },
          },
        });
        previousCandidates = await candidate.count({
          where: {
            fk_profile: { [Op.in]: profileIds },
            created_at: { [Op.between]: [previousSevenDaysAgo, previousPeriodEnd] },
          },
        });

        // ── Weekly Applications: count candidates created per day ──
        const candidatesByDay = await candidate.findAll({
          where: {
            fk_profile: { [Op.in]: profileIds },
            created_at: { [Op.between]: [sevenDaysAgo, today] },
          },
          attributes: [
            [candidate.sequelize.fn('DATE', candidate.sequelize.col('candidate.created_at')), 'day'],
            [candidate.sequelize.fn('COUNT', candidate.sequelize.col('candidate.id')), 'count'],
          ],
          group: [candidate.sequelize.fn('DATE', candidate.sequelize.col('candidate.created_at'))],
          raw: true,
        });

        // Map DB results to the 7-day array
        candidatesByDay.forEach((row) => {
          const rowDate = new Date(row.day);
          const diffDays = Math.floor((rowDate - sevenDaysAgo) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            weeklyApplications[diffDays] = parseInt(row.count) || 0;
          }
        });

        // ── Weekly Interviews: count meetings created per day ──
        const candidateIds = await candidate.findAll({
          where: { fk_profile: { [Op.in]: profileIds } },
          attributes: ["id"],
          raw: true,
        });
        const candIds = candidateIds.map((c) => c.id);

        if (candIds.length > 0 && meeting) {
          totalInterviews = await meeting.count({
            where: { fk_candidate: { [Op.in]: candIds } },
          });

          const meetingsByDay = await meeting.findAll({
            where: {
              fk_candidate: { [Op.in]: candIds },
              createdAt: { [Op.between]: [sevenDaysAgo, today] },
            },
            attributes: [
              [meeting.sequelize.fn('DATE', meeting.sequelize.col('createdAt')), 'day'],
              [meeting.sequelize.fn('COUNT', meeting.sequelize.col('id')), 'count'],
            ],
            group: [meeting.sequelize.fn('DATE', meeting.sequelize.col('createdAt'))],
            raw: true,
          });

          meetingsByDay.forEach((row) => {
            const rowDate = new Date(row.day);
            const diffDays = Math.floor((rowDate - sevenDaysAgo) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
              weeklyInterviews[diffDays] = parseInt(row.count) || 0;
            }
          });
        }
        // ── Per-position weekly data for line chart ──
        positionWeekly.length = 0;
        for (const prof of profiles) {
          const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
          const rows = await candidate.findAll({
            where: {
              fk_profile: prof.id,
              created_at: { [Op.between]: [sevenDaysAgo, today] },
            },
            attributes: [
              [candidate.sequelize.fn('DATE', candidate.sequelize.col('candidate.created_at')), 'day'],
              [candidate.sequelize.fn('COUNT', candidate.sequelize.col('candidate.id')), 'count'],
            ],
            group: [candidate.sequelize.fn('DATE', candidate.sequelize.col('candidate.created_at'))],
            raw: true,
          });
          rows.forEach((row) => {
            const rowDate = new Date(row.day);
            const diffDays = Math.floor((rowDate - sevenDaysAgo) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
              dailyCounts[diffDays] = parseInt(row.count) || 0;
            }
          });
          // Also get total count for this profile
          const totalForProfile = await candidate.count({ where: { fk_profile: prof.id } });
          positionWeekly.push({ id: prof.id, title: prof.title || 'Untitled', data: dailyCounts, total: totalForProfile });
        }
      }
    }

    // ── Funnel counts: real status breakdown ──
    let funnelCounts = { received: 0, selected: 0, validated: 0, hired: 0, declined: 0, discarded: 0 };
    if (pIds.length > 0) {
      const allProfiles = await profile.findAll({
        where: { fk_project: { [Op.in]: pIds } },
        attributes: ["id"],
        raw: true,
      });
      const allProfileIds = allProfiles.map((p) => p.id);
      if (allProfileIds.length > 0) {
        const statusRows = await candidate.findAll({
          where: { fk_profile: { [Op.in]: allProfileIds } },
          attributes: [
            'status',
            [candidate.sequelize.fn('COUNT', candidate.sequelize.col('candidate.id')), 'count'],
          ],
          group: ['status'],
          raw: true,
        });
        statusRows.forEach((row) => {
          const key = (row.status || '').toLowerCase();
          if (key in funnelCounts) {
            funnelCounts[key] = parseInt(row.count) || 0;
          }
        });
      }
    }

    return res.json({
      stats: {
        totalProjects,
        activeProjects,
        totalCandidates,
        totalInterviews,
        weeklyApplications,
        weeklyInterviews,
        weekLabels,
        positionWeekly: positionWeekly || [],
        funnelCounts,
        trends: {
          totalProjects: { current: currentProjects, previous: previousProjects },
          activeProjects: { current: currentActiveProjects, previous: previousActiveProjects },
          totalCandidates: { current: currentCandidates, previous: previousCandidates },
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ error: "Failed to get stats" });
  }
};
