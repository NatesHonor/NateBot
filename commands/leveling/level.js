const { SlashCommandBuilder } = require('discord.js');
const getUserData = require('../../data/MySQL/functions/getUserData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Displays your current level'),
  async execute(interaction) {
    const discordUserId = interaction.user.id;

    try {
      const userData = await getUserData(discordUserId);
      if (!userData || Object.keys(userData).length === 0) {
        return interaction.reply('Your level data is not available.');
      }

      const level = userData.level || 1;

      interaction.reply(`Your current level is: ${level}`);
    } catch (error) {
      console.error('Error fetching player data:', error);
      interaction.reply('An error occurred while fetching the level. Please try again later.');
    }
  },
};
