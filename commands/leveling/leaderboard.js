const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the leaderboard ranking of all users'),
  async execute(interaction, { getLeaderboardData }) {
    try {
      const leaderboardData = await getLeaderboardData();

      if (!leaderboardData || leaderboardData.length === 0) {
        return interaction.reply('The leaderboard is currently empty.');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Leaderboard')
        .setDescription('Top 10 users with the highest level:')
        .addFields(
          leaderboardData.map((userData, index) => ({
            name: `${index + 1}. ${userData.minecraft_username}`,
            value: `Level: ${userData.level || 1}`,
            inline: false,
          }))
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      interaction.reply('An error occurred while fetching the leaderboard. Please try again later.');
    }
  },
};
