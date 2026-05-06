const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "JobOffer",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fk_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "profiles",
          key: "id",
        },
        unique: "uq_joboffer_fk_profile",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "job_offers",
      
      timestamps: true,
      indexes: [
        {
          name: "JobOffer_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "uq_joboffer_fk_profile",
          unique: true,
          fields: [{ name: "fk_profile" }],
        },
      ],
    }
  );
};
