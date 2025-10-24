// models/tag.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      Tag.belongsToMany(models.Activity, { 
      through: 'ActivityTags', 
      foreignKey: 'tagId', 
      otherKey: 'activityId',
      timestamps: false // <-- เพิ่มบรรทัดนี้
    });
    }
  }
  Tag.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags'
  });
  return Tag;
};
