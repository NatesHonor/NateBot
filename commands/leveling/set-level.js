const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const setUserLevelData = require('../../data/MySQL/functions/setUserLevelData')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Sets the level of a user')
    .addUserOption((option) => option.setName('user').setDescription('The user to set the level for').setRequired(true))
    .addIntegerOption((option) => option.setName('level').setDescription('The level to set').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    try {
      await setUserLevelData(user.id, level);
      interaction.reply(`Successfully set ${user.username}'s level to ${level}.`);
    } catch (error) {
      console.error('Error setting user level:', error);
      interaction.reply('An error occurred while setting the user level. Please try again later.');
    }
  },
};
