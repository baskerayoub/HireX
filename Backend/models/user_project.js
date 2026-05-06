const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_project', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fk_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fk_project: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_project',
    timestamps: false,
    indexes: [
      {
        name: "user_project_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
