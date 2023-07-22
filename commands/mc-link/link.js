const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const crypto = require('crypto');
const config = require('../../config.json');
const { setTimeout } = require('timers');

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your Minecraft Account to your Discord!'),
  async execute(interaction) {
    const token = generateToken();

    const discordUserId = interaction.user.id;
    const sql = 'INSERT INTO tokens (discord_user_id, token, expire_at) VALUES (?, ?, ?)';

    const expireTime = Date.now() + 5 * 60 * 1000;

    if (connection.state === 'disconnected') {
      connection.connect(err => {
        if (err) {
          console.error('Error connecting to MySQL database:', err);
          return interaction.reply('An error occurred while generating the link. Please try again later.');
        }
        executeQuery(connection, sql, [discordUserId, token, expireTime], interaction);
      });
    } else {
      executeQuery(connection, sql, [discordUserId, token, expireTime], interaction);
    }
  },
};

function generateToken() {
  const tokenLength = 16;
  const buffer = crypto.randomBytes(tokenLength);
  const token = buffer.toString('hex');
  return token;
}

function executeQuery(connection, sql, values, interaction) {
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error storing token in MySQL:', err);
      return interaction.reply('An error occurred while generating the link. Please try again later.');
    }
    console.log('Token stored in MySQL');

    connection.end();

    const linkCommand = `/link ${values[1]}`;
    interaction.reply(`To link your Minecraft account to your Discord profile, please run the following command in Minecraft:\n\`${linkCommand}\``);

    // Set a timeout to remove the token after 5 minutes
    setTimeout(() => {
      removeToken(values[1]);
    }, 5 * 60 * 1000);
  });
}

function removeToken(token) {
  const sql = 'DELETE FROM tokens WHERE token = ?';
  connection.query(sql, [token], (err, result) => {
    if (err) {
      console.error('Error removing token from MySQL:', err);
    } else {
      console.log('Token removed from MySQL');
    }
  });
}
