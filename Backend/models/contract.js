// models/contract.js
'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.candidate, { foreignKey: 'fk_candidate', as: 'candidate' });
      Contract.belongsTo(models.users, { foreignKey: 'fk_user' });
      Contract.belongsTo(models.template, { foreignKey: 'fk_template' });
    }
  }

  Contract.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    work_mode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_salary: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contract_s3_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'contract',
    tableName: 'contract',
    timestamps: true,
    createdAt: 'creation_date',
    updatedAt: false
  });

  return Contract;
};
