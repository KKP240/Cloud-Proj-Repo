'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityImages', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      activityId: {
        type: Sequelize.INTEGER,
        references: { model: 'Activities', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      url: { type: Sequelize.STRING, allowNull: false },
      alt: { type: Sequelize.STRING },
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityImages');
  }
};
