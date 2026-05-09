'use strict';

const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class Candidate extends Model {
    static associate(models) {
      Candidate.belongsTo(models.profile, {
        foreignKey: 'fk_profile',
        as: 'profile'
      });
      Candidate.hasMany(models.meeting, { foreignKey: 'fk_candidate' });
      Candidate.hasMany(models.question, { foreignKey: 'fk_candidate' });
      Candidate.hasMany(models.contract, { foreignKey: 'fk_candidate' });
    }

    /** Generate SHA-256 hash from file buffer */
    static hashFile(buffer) {
      return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    /** Check if this candidate already has a valid AI ranking */
    get isAlreadyRanked() {
      return !!(this.is_ranked && this.ai_response_cache && this.ranking_timestamp);
    }
  }

  Candidate.init({
    fk_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'profiles', key: 'id' }
    },
    cv_s3_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cv_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'SHA-256 hash of CV file for duplicate detection'
    },
    type_importation: {
      type: DataTypes.ENUM('local', 'platforme'),
      allowNull: true,
    },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    education: { type: DataTypes.STRING, allowNull: true },
    current_position: { type: DataTypes.STRING, allowNull: true },
    summary: { type: DataTypes.STRING, allowNull: true },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0], msg: 'Years of experience cannot be negative' } }
    },
    technical_skills: { type: DataTypes.STRING, allowNull: true },
    soft_skills: { type: DataTypes.STRING, allowNull: true },
    languages: { type: DataTypes.STRING, allowNull: true },
    hobbies: { type: DataTypes.STRING, allowNull: true },
    certifications: { type: DataTypes.STRING, allowNull: true },
    experiences: { type: DataTypes.TEXT, allowNull: true },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'received',
      validate: {
        isIn: {
          args: [['received', 'selected', 'validated', 'Declined', 'traited', 'discarded']],
          msg: 'Invalid status'
        }
      }
    },
    // ── AI Ranking fields ───────────────────
    score_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: { args: [0] }, max: { args: [100] } }
    },
    score_description: { type: DataTypes.TEXT, allowNull: true },
    manual_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Manual recruiter rank override'
    },
    is_ranked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'True once AI ranking has completed'
    },
    ranking_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When AI ranking was performed'
    },
    ai_response_cache: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Full cached AI ranking JSON response'
    },
    ranking_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Ranking model version for cache invalidation'
    },
    upload_token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'candidate',
    tableName: 'candidate',
    underscored: true,
    timestamps: true
  });

  return Candidate;
};
