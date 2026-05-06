'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LinkedInToken extends Model {
    static associate(models) {
      // Associations handled in index.js
    }
  }

  LinkedInToken.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fk_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    linkedin_person_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'LinkedIn URN like "urn:li:person:xxxxx"'
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'linkedin_token',
    tableName: 'linkedin_tokens',
    timestamps: true
  });

  return LinkedInToken;
};
