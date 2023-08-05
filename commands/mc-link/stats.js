const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const config = require('../../config.json');
const fetch = require('node-fetch');
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
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Displays profile information'),
  async execute(interaction) {
    const discordUserId = interaction.user.id;

    const sql = 'SELECT minecraft_username FROM account_links WHERE discord_user_id = ?';
    connection.query(sql, [discordUserId], async (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return interaction.reply('An error occurred while fetching the profile. Please try again later.');
      }

      if (result.length === 0) {
        return interaction.reply('You have not linked your Minecraft account.');
      }

      const minecraftUsername = result[0].minecraft_username;

      try {
        const response = await fetch(`http://localhost:3000/player/${encodeURIComponent(minecraftUsername)}`);
        const data = await response.json();

        if (
          !data ||
          typeof data !== 'object' ||
          typeof data.rank !== 'string' ||
          typeof data.level !== 'number' ||
          typeof data.avatarUrl !== 'string' ||
          (data.playtime && typeof data.playtime !== 'string')
        ) {
          console.error('Invalid data received from the API:', data);
          return interaction.reply('An error occurred while fetching the profile. Please try again later.');
        }

        const rank = data.rank;
        const level = data.level.toString();
        const avatarUrl = data.avatarUrl;
        const playtime = data.playtime || 'N/A';

        const embed = new EmbedBuilder()
          .setColor(rank.toLowerCase() === 'admin' ? '#FF0000' : '#0099ff')
          .setTitle('Profile Information')
          .addFields(
            { name: 'Rank', value: rank, inline: true },
            { name: 'Minecraft Username', value: minecraftUsername, inline: true },
            { name: 'Level', value: level, inline: true },
            { name: 'Playtime', value: playtime, inline: true },
          )
          .setThumbnail(avatarUrl);

        interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching player data:', error);
        interaction.reply('An error occurred while fetching the profile. Please try again later.');
      }
    });
  },
};