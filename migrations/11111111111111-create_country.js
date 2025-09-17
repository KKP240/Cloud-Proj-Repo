'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Activities','country',{ type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Activities','province',{ type: Sequelize.STRING, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Activities','country');
    await queryInterface.removeColumn('Activities','province');
    await queryInterface.removeColumn('Activities','startDate');
    await queryInterface.removeColumn('Activities','endDate');
    await queryInterface.removeColumn('Activities','capacity');
  }
};