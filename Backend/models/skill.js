'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {
      // N-N with profile via profile_skills
    }
  }

  Skill.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.ENUM('technical', 'soft', 'language', 'tool', 'other'),
      allowNull: false,
      defaultValue: 'technical'
    }
  }, {
    sequelize,
    modelName: 'skill',
    tableName: 'skills',
    timestamps: true
  });

  return Skill;
};
