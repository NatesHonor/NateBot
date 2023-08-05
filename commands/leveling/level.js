const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Displays your current level'),
  async execute(interaction, { getUserData }) {
    const discordUserId = interaction.user.id;

    try {
      const userData = await getUserData(discordUserId);
      if (!userData || Object.keys(userData).length === 0) {
        return interaction.reply('You have not linked your Minecraft account.');
      }

      const level = userData.level || 1;

      interaction.reply(`Your current level is: ${level}`);
    } catch (error) {
      console.error('Error fetching player data:', error);
      interaction.reply('An error occurred while fetching the level. Please try again later.');
    }
  },
};
