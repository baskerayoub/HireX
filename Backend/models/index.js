"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file !== "init-models.js" &&
      (file.slice(-3) === ".js" || file.slice(-3) === ".ts")
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ═══════════════════════════════════════════════════════════════
// ASSOCIATIONS
// ═══════════════════════════════════════════════════════════════

// Project <-> Profile
if (db.project && db.profile) {
  db.project.hasMany(db.profile, { as: "Profiles", foreignKey: "fk_project" });
  db.profile.belongsTo(db.project, { as: "Project", foreignKey: "fk_project" });
}

// Project <-> Users (responsible user)
if (db.project && db.users) {
  db.project.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.users.hasMany(db.project, { as: "Projects", foreignKey: "fk_user" });
}

// User <-> Project (many-to-many via user_project)
if (db.users && db.project && db.user_project) {
  db.users.belongsToMany(db.project, {
    through: db.user_project,
    foreignKey: "userId",
    otherKey: "projectId",
    as: "UserProjects",
  });
  db.project.belongsToMany(db.users, {
    through: db.user_project,
    foreignKey: "projectId",
    otherKey: "userId",
    as: "ProjectUsers",
  });
}

// Profile <-> JobOffer
if (db.profile && db.JobOffer) {
  db.profile.hasOne(db.JobOffer, { as: "JobOffer", foreignKey: "fk_profile" });
  db.JobOffer.belongsTo(db.profile, {
    as: "Profile",
    foreignKey: "fk_profile",
  });
}

// JobOffer <-> JobPosting
if (db.JobOffer && db.JobPosting) {
  db.JobOffer.hasMany(db.JobPosting, {
    as: "JobPostings",
    foreignKey: "fk_JobOffer",
  });
  db.JobPosting.belongsTo(db.JobOffer, {
    as: "JobOffer",
    foreignKey: "fk_JobOffer",
  });
}

// Candidate associations
if (db.candidate && db.profile) {
  db.candidate.belongsTo(db.profile, { as: "Profile", foreignKey: "fk_profile" });
  db.profile.hasMany(db.candidate, { as: "Candidates", foreignKey: "fk_profile" });
}

// Meeting associations
if (db.meeting && db.candidate && db.users) {
  db.meeting.belongsTo(db.candidate, { as: "Candidate", foreignKey: "fk_candidate" });
  db.meeting.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.candidate.hasMany(db.meeting, { as: "Meetings", foreignKey: "fk_candidate" });
  db.users.hasMany(db.meeting, { as: "Meetings", foreignKey: "fk_user" });
}

// Feedback associations
if (db.feedback && db.meeting && db.users) {
  db.feedback.belongsTo(db.meeting, { as: "Meeting", foreignKey: "fk_meeting" });
  db.feedback.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.meeting.hasOne(db.feedback, { as: "Feedback", foreignKey: "fk_meeting" });
  db.users.hasMany(db.feedback, { as: "Feedbacks", foreignKey: "fk_user" });
}

// Question associations
if (db.question && db.profile && db.users && db.candidate) {
  db.question.belongsTo(db.profile, { as: "Profile", foreignKey: "fk_profile" });
  db.question.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.question.belongsTo(db.candidate, { as: "Candidate", foreignKey: "fk_candidate" });
  db.profile.hasMany(db.question, { as: "Questions", foreignKey: "fk_profile" });
  db.users.hasMany(db.question, { as: "Questions", foreignKey: "fk_user" });
  db.candidate.hasMany(db.question, { as: "Questions", foreignKey: "fk_candidate" });
}

// Template associations
if (db.template && db.users) {
  db.template.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.users.hasMany(db.template, { as: "Templates", foreignKey: "fk_user" });
}

// TemplateField associations
if (db.templatefield && db.template) {
  db.templatefield.belongsTo(db.template, { as: "Template", foreignKey: "fk_template" });
  db.template.hasMany(db.templatefield, { as: "TemplateFields", foreignKey: "fk_template" });
}

// Contract associations
if (db.contract && db.candidate && db.users && db.template) {
  db.contract.belongsTo(db.candidate, { as: "Candidate", foreignKey: "fk_candidate" });
  db.contract.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
  db.contract.belongsTo(db.template, { as: "Template", foreignKey: "fk_template" });
  db.candidate.hasMany(db.contract, { as: "Contracts", foreignKey: "fk_candidate" });
  db.users.hasMany(db.contract, { as: "Contracts", foreignKey: "fk_user" });
  db.template.hasMany(db.contract, { as: "Contracts", foreignKey: "fk_template" });
}

// ═══════════════════════════════════════════════════════════════
// NEW ASSOCIATIONS — Skills, AI, LinkedIn
// ═══════════════════════════════════════════════════════════════

// Profile <-> Skill (N-N via profile_skills)
if (db.profile && db.skill && db.profile_skill) {
  db.profile.belongsToMany(db.skill, {
    through: db.profile_skill,
    foreignKey: "profileId",
    otherKey: "skillId",
    as: "Skills",
  });
  db.skill.belongsToMany(db.profile, {
    through: db.profile_skill,
    foreignKey: "skillId",
    otherKey: "profileId",
    as: "Profiles",
  });
}

// Candidate <-> AI Analysis (1-N)
if (db.candidate && db.ai_analysis) {
  db.candidate.hasMany(db.ai_analysis, { as: "AiAnalyses", foreignKey: "fk_candidate" });
  db.ai_analysis.belongsTo(db.candidate, { as: "Candidate", foreignKey: "fk_candidate" });
}

// User <-> LinkedIn Token (1-1)
if (db.users && db.linkedin_token) {
  db.users.hasOne(db.linkedin_token, { as: "LinkedInToken", foreignKey: "fk_user" });
  db.linkedin_token.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
}

// User <-> AI Recommendation Cache (1-N)
if (db.users && db.ai_recommendation_cache) {
  db.users.hasMany(db.ai_recommendation_cache, { as: "RecommendationCaches", foreignKey: "fk_user" });
  db.ai_recommendation_cache.belongsTo(db.users, { as: "User", foreignKey: "fk_user" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
