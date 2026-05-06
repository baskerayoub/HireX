const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "profile",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fk_project: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "projects",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      technicalSkills: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      softSkills: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      languages: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mainMissions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      education: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      typeContract: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "profiles",
      
      timestamps: true,
      indexes: [
        {
          name: "Profile_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
