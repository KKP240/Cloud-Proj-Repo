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
    userId: DataTypes.INTEGER,
    activityId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    registeredAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Registration',
  });
  return Registration;
};
