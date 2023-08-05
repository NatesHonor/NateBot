const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getUserData = require('../../data/MySQL/functions/getUserData');
const calculateExpRequiredForLevel = require('../../data/MySQL/functions/calculateExpRequiredForLevel');

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

      const currentExp = userData.exp || 0;
      const currentLevel = userData.level || 1;
      const expNeededForNextLevel = calculateExpRequiredForLevel(currentLevel + 1);
      const progress = (currentExp / expNeededForNextLevel) * 100;

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Level Information')
        .setDescription(`You are currently at level ${currentLevel}!`)
        .addFields(
          { name: 'Progress to Level ' + (currentLevel + 1), value: `${currentExp}/${expNeededForNextLevel} XP`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: 'Progress Bar', value: getProgressBar(progress), inline: true }
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching player data:', error);
      interaction.reply('An error occurred while fetching the level. Please try again later.');
    }
  },
};

// Helper function to create the progress bar
function getProgressBar(progress) {
  const progressBarLength = 20;
  const filledBlocks = Math.round(progressBarLength * (progress / 100));
  const emptyBlocks = progressBarLength - filledBlocks;
  return `${'▓'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)} [${progress.toFixed(1)}%]`;
}
