const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const config = require('../../config.json');

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to the database!');
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Moderation commands')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of moderation')
        .setRequired(true)
        .addChoice('Reports', 'reports')
        .addChoice('Tickets', 'tickets')
    )
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Platform for reports (Discord or Minecraft)')
        .setRequired(true)
        .addChoice('Discord', 'discord')
        .addChoice('Minecraft', 'minecraft')
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const platform = interaction.options.getString('platform');

    if (type === 'reports') {
      if (platform === 'discord' || platform === 'minecraft') {
        interaction.reply('Starting moderation...');

        const exampleReportEmbed = {
          color: parseInt('FF0000', 16),
          title: 'Example Report',
          fields: [
            { name: 'Reporter', value: `<@${reporterId}>`, inline: true },
            { name: 'Platform', value: platformName, inline: true },
            { name: 'User', value: user },
            { name: 'Reason', value: reason },
            { name: 'Evidence', value: evidence || 'No evidence provided' },
          ],
          timestamp: new Date(),
        };
        interaction.user.send({ embeds: [exampleReportEmbed] })
          .then((msg) => {
            msg.react('✅') 
              .then(() => msg.react('❌'));
          })
          .catch(console.error);
      } else {
        interaction.reply('Invalid platform. Please choose either "discord" or "minecraft".');
      }
    } else if (type === 'tickets') {
      interaction.reply('Tickets command is not implemented yet.');
    } else {
      interaction.reply('Invalid type. Please choose either "reports" or "tickets".');
    }
  },
};
