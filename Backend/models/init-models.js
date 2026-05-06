var DataTypes = require("sequelize").DataTypes;
var _JobOffer = require("./JobOffer");
var _JobPosting = require("./JobPosting");
var _SequelizeMeta = require("./SequelizeMeta");
var _profile = require("./profile");
var _project = require("./project");
var _user_project = require("./user_project");
var _users = require("./users");

function initModels(sequelize) {
  var JobOffer = _JobOffer(sequelize, DataTypes);
  var JobPosting = _JobPosting(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var profile = _profile(sequelize, DataTypes);
  var project = _project(sequelize, DataTypes);
  var user_project = _user_project(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  JobPosting.belongsTo(JobOffer, { as: "fk_JobOffer_JobOffer", foreignKey: "fk_JobOffer"});
  JobOffer.hasMany(JobPosting, { as: "JobPostings", foreignKey: "fk_JobOffer"});
  JobOffer.belongsTo(profile, { as: "fk_profile_profile", foreignKey: "fk_profile"});
  profile.hasOne(JobOffer, { as: "JobOffer", foreignKey: "fk_profile"});
  profile.belongsTo(project, { as: "fk_project_project", foreignKey: "fk_project"});
  project.hasMany(profile, { as: "profiles", foreignKey: "fk_project"});
  user_project.belongsTo(project, { as: "fk_project_project", foreignKey: "fk_project"});
  project.hasMany(user_project, { as: "user_projects", foreignKey: "fk_project"});
  project.belongsTo(users, { as: "fk_user_user", foreignKey: "fk_user"});
  users.hasMany(project, { as: "projects", foreignKey: "fk_user"});
  user_project.belongsTo(users, { as: "fk_user_user", foreignKey: "fk_user"});
  users.hasMany(user_project, { as: "user_projects", foreignKey: "fk_user"});

  return {
    JobOffer,
    JobPosting,
    SequelizeMeta,
    profile,
    project,
    user_project,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
