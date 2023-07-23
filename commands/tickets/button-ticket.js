const { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder, Permissions } = require('discord.js');
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
  data: {
    name: 'ticket',
    description: 'Create a new ticket',
  },

  async execute(interaction) {
    const ticketCategoryID = await interaction.guild.channels.fetch(config.ticketCategoryID);
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const ticketContent = 'Your ticket content goes here.'; // Replace with the actual ticket content.

    const ticketData = {
      user_id: userId,
      guild_id: guildId,
      message: ticketContent,
      is_closed: false,
    };

    const insertQuery = 'INSERT INTO tickets SET ?';
    connection.query(insertQuery, ticketData, async (err, result) => {
      if (err) {
        console.error('Error creating a new ticket:', err);
        interaction.reply('There was an error creating a new ticket.');
      } else {
        const ticketId = result.insertId;
        const ticketUrl = `https://your-website.com/tickets/${ticketId}`; // Replace with your website URL.

        const create = new ButtonBuilder()
          .setCustomId('confirm')
          .setLabel('Create a new Ticket')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
          .addComponents(create);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('New Ticket')
          .setDescription(`Click the button below to create a new ticket.\n\n[View Ticket](${ticketUrl})`)
          .setTimestamp();

        // Send the initial embed and button row
        interaction.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'confirm' && i.user.id === userId;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (buttonInteraction) => {
          // Create a new text channel in the specified category
          const ticketCategory = interaction.guild.channels.cache.get(ticketCategoryID);
          if (ticketCategory && ticketCategory.type === 'GUILD_CATEGORY') {
            try {
              const channel = await interaction.guild.channels.create(`ticket-${ticketId}`, {
                type: 'GUILD_TEXT',
                parent: ticketCategory,
                permissionOverwrites: [
                  {
                    id: interaction.guild.roles.everyone,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                  },
                  {
                    id: userId,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL],
                  },
                ],
              });

              const newTicketUrl = `https://your-website.com/tickets/${ticketId}`;
              const newEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('New Ticket')
                .setDescription(`Click the button below to create a new ticket.\n\n[View Ticket](${newTicketUrl})`)
                .setTimestamp();

              const newButton = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Create a new Ticket')
                .setStyle(ButtonStyle.Success);

              const newRow = new ActionRowBuilder()
                .addComponents(newButton);

              channel.send({ embeds: [newEmbed], components: [newRow] });

              // Send the reply after creating the new ticket channel
              buttonInteraction.reply('A new ticket channel has been created!');
            } catch (error) {
              console.error('Error creating a new channel:', error);
              buttonInteraction.reply('There was an error creating the ticket channel.');
            }
          } else {
            buttonInteraction.reply('The ticket category does not exist or is not a category channel.');
          }
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            interaction.reply('The ticket creation process has timed out.');
          }
        });
      }
    });
  },
};
