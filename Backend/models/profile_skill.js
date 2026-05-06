'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProfileSkill extends Model {
    static associate(models) {
      // Pivot table — associations set up in index.js
    }
  }

  ProfileSkill.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id'
      }
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skills',
        key: 'id'
      }
    },
    importance: {
      type: DataTypes.ENUM('required', 'preferred', 'nice_to_have'),
      allowNull: false,
      defaultValue: 'required'
    }
  }, {
    sequelize,
    modelName: 'profile_skill',
    tableName: 'profile_skills',
    timestamps: false
  });

  return ProfileSkill;
};
