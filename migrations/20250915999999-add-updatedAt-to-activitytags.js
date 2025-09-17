'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // เพิ่มคอลัมน์ updatedAt แบบไม่เป็น null และใส่ default เป็น NOW()
    await queryInterface.addColumn('ActivityTags', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    });

    // (ถ้าต้องการ) ถ้าตารางไม่มี createdAt หรือมีแบบผิด ให้แก้ได้ที่นี่
    // but your table already has createdAt per earlier migration
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ActivityTags', 'updatedAt');
  }
};
