// models/templatefield.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TemplateField extends Model {
    static associate(models) {
      TemplateField.belongsTo(models.template, { foreignKey: 'fk_template' });
    }
  }

  TemplateField.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fk_template: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    placeholder: {
      type: DataTypes.STRING,
      allowNull: false
    },
    system_field: {
      type: DataTypes.STRING,
      allowNull: false
    },
    field_type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'templatefield',
    tableName: 'template_fields',
    timestamps: false
  });

  return TemplateField;
};
