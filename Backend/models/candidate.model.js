'use strict';

const { Model } = require('sequelize');

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
  }

  Candidate.init({
    fk_profile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id'
      }
    },
    cv_s3_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type_importation: {
      type: DataTypes.ENUM('local', 'platforme'),
      allowNull: true,
      comment: "Type d'importation du CV: local ou platforme"
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    education: {
      type: DataTypes.STRING,
      allowNull: true
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Les années d\'expérience ne peuvent pas être négatives'
        }
      }
    },
    technical_skills: {
      type: DataTypes.STRING,
      allowNull: true
    },
    soft_skills: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languages: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hobbies: {
      type: DataTypes.STRING,
      allowNull: true
    },
    certifications: {
      type: DataTypes.STRING,
      allowNull: true
    },
    experiences: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    current_position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'received',
      validate: {
        isIn: {
          args: [['received', 'selected', 'validated', 'Declined', 'traited', 'discarded']],
          msg: 'Le statut doit être received, selected, validated, Declined, traited ou discarded'
        }
      }
    },
    score_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Le score ne peut pas être négatif'
        },
        max: {
          args: [100],
          msg: 'Le score ne peut pas dépasser 100'
        }
      }
    },
    score_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manual_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Position manuelle du candidat dans le classement'
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
