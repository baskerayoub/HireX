'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AiAnalysis extends Model {
    static associate(models) {
      // Associations handled in index.js
    }
  }

  AiAnalysis.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fk_candidate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'candidate',
        key: 'id'
      }
    },
    analysis_type: {
      type: DataTypes.ENUM('cv_parse', 'skill_extract', 'match_score', 'ranking'),
      allowNull: false
    },
    input_data: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'JSON string of the input sent to AI'
    },
    output_data: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'JSON string of the AI response'
    },
    match_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    skills_found: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of extracted skills'
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'ai_analysis',
    tableName: 'ai_analyses',
    timestamps: true
  });

  return AiAnalysis;
};
