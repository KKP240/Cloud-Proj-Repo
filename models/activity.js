// models/activity.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      Activity.hasMany(models.Registration, { foreignKey: 'activityId' });
      Activity.hasMany(models.ActivityImage, { foreignKey: 'activityId' });
      Activity.hasMany(models.Comment, { foreignKey: 'activityId' });
      Activity.belongsToMany(models.Tag, { through: 'ActivityTags', foreignKey: 'activityId', otherKey: 'tagId' });
      // หากต้องการเก็บ creator ของกิจกรรม (user) ให้สร้างคอลัมน์ creatorId ผ่าน migration แล้ว uncomment:
      // Activity.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
    }
  }
  Activity.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    country: DataTypes.STRING,
    province: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    capacity: DataTypes.INTEGER,
    posterUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Activity',
    tableName: 'Activities'
  });
  return Activity;
};
