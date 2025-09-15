// models/registration.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Registration extends Model {
    static associate(models) {
      Registration.belongsTo(models.User, { foreignKey: 'userId' });
      Registration.belongsTo(models.Activity, { foreignKey: 'activityId' });
    }
  }
  Registration.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    activityId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'registered' },
    registeredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Registration',
    tableName: 'Registrations'
  });
  return Registration;
};
