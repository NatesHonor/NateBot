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
    .setName('ticket')
    .setDescription('Create a new ticket'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const ticketContent = 'Your ticket content goes here.';

    const ticketData = {
      user_id: userId,
      channel_id: channelId,
      message: ticketContent,
      is_closed: false,
    };

    const insertQuery = 'INSERT INTO tickets SET ?';
    connection.query(insertQuery, ticketData, (err, result) => {
      if (err) {
        console.error('Error creating a new ticket:', err);
        interaction.reply('There was an error creating a new ticket.');
      } else {
        const ticketId = result.insertId;
        const ticketUrl = `https://your-website.com/tickets/${ticketId}`; // Replace with your website URL.

        interaction.reply(`New ticket created! You can view your ticket here: ${ticketUrl}`);
      }
    });
  },
};
