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
  }
});

module.exports = {
    data: new SlashCommandBuilder()
      .setName('report')
      .setDescription('Report an offense')
      .addSubcommand(subcommand =>
        subcommand
          .setName('discord')
          .setDescription('Report an offense that occurred on Discord')
          .addStringOption(option =>
            option.setName('user')
              .setDescription('The Discord ID of the reported user')
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('reason')
              .setDescription('The reason for the report')
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('evidence')
              .setDescription('Evidence for the report (optional)')
              .setRequired(false)
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('minecraft')
          .setDescription('Report an offense that occurred in Minecraft')
          .addStringOption(option =>
            option.setName('user')
              .setDescription('The Minecraft username of the reported user')
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('reason')
              .setDescription('The reason for the report')
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('evidence')
              .setDescription('Evidence for the report (optional)')
              .setRequired(false)
          )
      ),
    async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const user = interaction.options.getString('user');
      const reason = interaction.options.getString('reason');
      const evidence = interaction.options.getString('evidence');
      const reporterId = interaction.user.id;
  
      let platformName = '';
      if (subcommand === 'discord') {
        platformName = 'Discord';
      } else if (subcommand === 'minecraft') {
        platformName = 'Minecraft';
      }
  
      const reportChannelId = '1131582786365554810';
      const reportChannel = interaction.guild.channels.cache.get(reportChannelId);
  
      const sql = 'INSERT INTO reports (reporter_id, platform, user, reason, evidence, claimed) VALUES (?, ?, ?, ?, ?, ?)';
      connection.query(sql, [reporterId, platformName, user, reason, evidence, false], (err, result) => {f
      if (err) {
        console.error('Error storing the report in the database:', err);
        return interaction.reply('An error occurred while submitting the report. Please try again later.');
      }

      console.log('Report submitted and stored in the database');

      const reportEmbed = {
        color: parseInt('FF0000', 16),
        title: 'New Report',
        fields: [
          { name: 'Reporter', value: `<@${reporterId}>`, inline: true },
          { name: 'Platform', value: platformName, inline: true },
          { name: 'User', value: user },
          { name: 'Reason', value: reason },
          { name: 'Evidence', value: evidence || 'No evidence provided', inline: true },
        ],
        timestamp: new Date(),
      };

      reportChannel.send({ embeds: [reportEmbed] });

      interaction.reply('Your report has been submitted successfully.');
    });
  },
};
