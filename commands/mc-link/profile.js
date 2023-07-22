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
    .setName('profile')
    .setDescription('Displays profile information')
    .addStringOption((option) =>
      option.setName('username').setDescription('Username of the profile to fetch')
    ),
  async execute(interaction) {
    const username = interaction.options.getString('username');
    const discordUserId = username ? null : interaction.user.id;

    const sql = 'SELECT `rank`, minecraft_username, playtime FROM account_links WHERE discord_user_id = ? OR minecraft_username = ?';
    connection.query(sql, [discordUserId, username], (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return interaction.reply('An error occurred while fetching the profile. Please try again later.');
      }

      if (result.length === 0) {
        return interaction.reply('Profile not found. Please ensure the account is linked or provide a valid username.');
      }

      const rank = result[0].rank;
      const minecraftUsername = result[0].minecraft_username;
      const playtime = result[0].playtime;
      const avatarUrl = `https://minotar.net/body/${minecraftUsername}/200.png`;

      const embed = new EmbedBuilder()
        .setColor(rank.toLowerCase() === 'admin' ? '#FF0000' : '#0099ff')
        .setTitle('Profile Information')
        .addFields(
          { name: 'Rank', value: rank.toLowerCase() === 'admin' ? 'ADMIN' : rank },
          { name: 'Minecraft Username', value: minecraftUsername, inline: true },
          { name: 'Playtime', value: playtime, inline: true },
        )
        .setThumbnail(avatarUrl);

      interaction.reply({ embeds: [embed] });
    });
  },
};