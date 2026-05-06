// models/template.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Template extends Model {
    static associate(models) {
      Template.belongsTo(models.users, { foreignKey: 'fk_user' });
      Template.hasMany(models.templatefield, { foreignKey: 'fk_template' });
      Template.hasMany(models.contract, { foreignKey: 'fk_template' });
    }
  }

  Template.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    format: {
      type: DataTypes.ENUM('word', 'html'),
      allowNull: false
    },
    s3_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'template',
    tableName: 'templates',
    timestamps: true,
    createdAt: 'creation_date',
    updatedAt: false
  });

  return Template;
};
