const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "applications",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      profile_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "profiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      reason_for_posting: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cv_file_path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "applications",
      
      timestamps: false,
      indexes: [
        {
          name: "applications_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
