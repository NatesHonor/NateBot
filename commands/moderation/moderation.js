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
    .setName('moderation')
    .setDescription('Moderation commands')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type of moderation you will be reviewing')
        .setRequired(true)
        .addChoices({ name: 'Reports', value: 'reports' })
        .addChoices({ name: 'Tickets', value: 'tickets' })
    )
    .addStringOption(option =>
      option
        .setName('platform')
        .setDescription('Platform for reports (Discord or Minecraft)')
        .setRequired(true)
        .addChoices({ name: 'Discord', value: 'discord' })
        .addChoices({ name: 'Minecraft', value: 'minecraft' })
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const platform = interaction.options.getString('platform');

    if (type === 'reports') {
      if (platform === 'discord' || platform === 'minecraft') {
        const platformName = platform === 'discord' ? 'Discord' : 'Minecraft';
        interaction.reply(`Starting moderation for ${platformName} reports...`);

        const query = `SELECT id, reporter_id, user, reason, report_key, claimed FROM reports WHERE platform = ? AND claimed = 0`;

        connection.query(query, [platform], (err, rows) => {
          if (err) {
            console.error('Error fetching reports:', err);
            interaction.channel.send('There was an error while fetching reports.');
            return;
          }

          if (rows.length === 0) {
            interaction.channel.send(`There are no unclaimed ${platformName} reports.`);
            return;
          }

          let currentIndex = 0;

          const sendNextReport = () => {
            if (currentIndex >= rows.length) {
              interaction.channel.send('There are no more unclaimed reports.');
              return;
            }

            const report = rows[currentIndex];
            currentIndex++;

            const reportEmbed = {
              color: parseInt('FF0000', 16),
              title: `${platformName} Report`,
              fields: [
                { name: 'Reporter', value: `<@${report.reporter_id}>`, inline: true },
                { name: 'User', value: report.user },
                { name: 'Reason', value: report.reason },
              ],
              timestamp: new Date(),
            };

            interaction.channel.send({ embeds: [reportEmbed] })
              .then((msg) => {
                msg.react('✅')
                  .then(() => msg.react('❌'))
                  .catch(console.error);
              })
              .catch(console.error);
          };

          sendNextReport();

          const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
          };

          const collector = interaction.channel.createReactionCollector({ filter, time: 60000 });

          collector.on('collect', (reaction) => {
            if (reaction.emoji.name === '✅') {
              
              const report = rows[currentIndex - 1];
              const key = report.report_key;
              const reporterId = report.reporter_id;
              const updateQuery = `UPDATE reports SET claimed = 1 WHERE id = ?`;

              connection.query(updateQuery, [report.id], (err) => {
                if (err) {
                  console.error('Error updating report:', err);
                }
              });

              interaction.user.send(`You claimed a report for ${platformName}. Here is the report key: ${key}`)
                .catch(console.error);
            }

            sendNextReport();
          });

          collector.on('end', (collected, reason) => {
            if (reason === 'time') {
              interaction.channel.send('The moderation session has ended due to inactivity.');
            }
          });
        });
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
