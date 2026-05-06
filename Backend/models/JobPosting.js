const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "JobPosting",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fk_JobOffer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "job_offers",
          key: "id",
        },
        unique: "unique_platform_posting",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      plateform: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: "unique_platform_posting",
      },
      URL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "job_postings",
      
      timestamps: true,
      indexes: [
        {
          name: "JobPosting_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "unique_platform_posting",
          unique: true,
          fields: [{ name: "fk_JobOffer" }, { name: "plateform" }],
        },
      ],
    }
  );
};
