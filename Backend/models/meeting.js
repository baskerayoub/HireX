// models/meeting.model.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    static associate(models) {
      Meeting.belongsTo(models.candidate, { foreignKey: 'fk_candidate' });
      Meeting.belongsTo(models.users, { foreignKey: 'fk_user' });
      Meeting.hasOne(models.feedback, { foreignKey: 'fk_meeting' });
    }
  }

  Meeting.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING
    },
    subject: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    other_participants: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Created', 'Cancelled', 'Failed', 'Updated'),
      allowNull: false
    },
    status_message: {
      type: DataTypes.STRING
    },
    platform: {
      type: DataTypes.STRING
    },
    platform_id_event: {
      type: DataTypes.STRING
    },
    link: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'meeting',
    tableName: 'meeting',
    timestamps: true,
    createdAt: true,
    updatedAt: false
  });

  return Meeting;
};
