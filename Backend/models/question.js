// models/question.model.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.belongsTo(models.profile, { foreignKey: 'fk_profile' });
      Question.belongsTo(models.users, { foreignKey: 'fk_user' });
      Question.belongsTo(models.candidate, { foreignKey: 'fk_candidate' });
    }
  }

  Question.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    interview_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'question',
    tableName: 'question',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });

  return Question;
};
