const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "project",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      fk_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      participants: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      resp: {
        type: DataTypes.STRING(100), // or whatever type you want
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "projects",
      
      timestamps: false,
      indexes: [
        {
          name: "Project_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
