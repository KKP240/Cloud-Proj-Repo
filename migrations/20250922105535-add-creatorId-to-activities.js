// migrations/{timestamp}-add-creatorId-to-activities.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Activities', 'creatorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE' // กำหนดให้ลบกิจกรรมถ้าผู้ใช้ที่สร้างกิจกรรมถูกลบ
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Activities', 'creatorId');
  }
};
