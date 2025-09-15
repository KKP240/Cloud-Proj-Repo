// models/activityimage.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivityImage extends Model {
    static associate(models) {
      ActivityImage.belongsTo(models.Activity, { foreignKey: 'activityId' });
    }
  }
  ActivityImage.init({
    activityId: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    alt: { type: DataTypes.STRING, allowNull: true },
    order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'ActivityImage',
    tableName: 'ActivityImages'
  });
  return ActivityImage;
};
