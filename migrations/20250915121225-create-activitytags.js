'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityTags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      activityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Activities', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tags', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // ensure (activityId, tagId) unique
    await queryInterface.addConstraint('ActivityTags', {
      fields: ['activityId', 'tagId'],
      type: 'unique',
      name: 'uc_activity_tags_activity_tag'
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.removeConstraint('ActivityTags', 'uc_activity_tags_activity_tag');
    await queryInterface.dropTable('ActivityTags');
  }
};
