// models/user.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // ผู้ใช้งานสามารถลงทะเบียนเข้าร่วมได้
      User.hasMany(models.Registration, { foreignKey: 'userId' });
      // ผู้ใช้งานสามารถคอมเมนต์ได้
      User.hasMany(models.Comment, { foreignKey: 'userId' });
      // (ถ้าต้องการให้ user สร้างกิจกรรม ให้เพิ่ม foreignKey creatorId ใน Activities ผ่าน migration แล้ว uncomment บรรทัดนี้)
      // User.hasMany(models.Activity, { foreignKey: 'creatorId', as: 'createdActivities' });
    }
  }
  User.init({
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  });
  return User;
};
