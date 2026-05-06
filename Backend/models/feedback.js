// models/feedback.model.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.meeting, { foreignKey: 'fk_meeting' });
      Feedback.belongsTo(models.users, { foreignKey: 'fk_user' });
    }
  }

  Feedback.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    comments: {
      type: DataTypes.STRING(500),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'feedback',
    tableName: 'feedback',
    timestamps: true,
    createdAt: 'created_at', // Use the column name from the migration
    updatedAt: false
  });

  return Feedback;
};
