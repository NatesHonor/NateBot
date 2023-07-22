const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

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
    .setName('unlink')
    .setDescription('Unlinks your Minecraft account from your Discord'),
  async execute(interaction) {
    const discordUserId = interaction.user.id;

    const sql = 'DELETE FROM account_links WHERE discord_user_id = ?';
    connection.query(sql, [discordUserId], (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return interaction.reply('An error occurred while unlinking your account. Please try again later.');
      }

      if (result.affectedRows === 0) {
        return interaction.reply('Your account is not linked. There is no data to unlink.');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Account Unlinked')
        .setDescription('Your Minecraft account has been successfully unlinked from your Discord.');

      interaction.reply({ embeds: [embed] });
    });
  },
};
