const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-ticket')
    .setDescription('Create a voice ticket'),

  async execute(interaction) {
    // Your command logic goes here
  },
};
