// models/activity.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {
      Activity.hasMany(models.Registration, { foreignKey: 'activityId' });
      Activity.hasMany(models.ActivityImage, { foreignKey: 'activityId' });
      Activity.hasMany(models.Comment, { foreignKey: 'activityId' });
      Activity.belongsToMany(models.Tag, { 
        through: 'ActivityTags', 
        foreignKey: 'activityId', 
        otherKey: 'tagId',
        timestamps: false // <-- เพิ่มบรรทัดนี้
      });
      Activity.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
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
    posterUrl: DataTypes.STRING,
    creatorId: { // เพิ่ม creatorId ที่จะเก็บ ID ของผู้สร้าง
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // ชี้ไปที่ตาราง Users
        key: 'id'       // คอลัมน์ที่ใช้เป็น key คือ 'id' ใน Users
      },
      onDelete: 'CASCADE' // หากลบ user กิจกรรมที่สร้างโดย user นี้ก็จะถูกลบไปด้วย
    }
  }, {
    sequelize,
    modelName: 'Activity',
    tableName: 'Activities'
  });
  return Activity;
};
