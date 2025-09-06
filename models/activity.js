'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      Activity.hasMany(models.Registration, { foreignKey: 'activityId' });
    }
  }
  Activity.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    capacity: DataTypes.INTEGER,
    posterUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};
