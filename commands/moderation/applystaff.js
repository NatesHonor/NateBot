const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('applystaffranks')
    .setDescription('Apply staff ranks'),

  async execute(interaction) {
    const staffData = require('../../data/JSON/staff.json');
    const totalDiscordIds = staffData.length;
    await interaction.reply(`Applying ranks to ${totalDiscordIds} Discord IDs.`);

    let addedRoles = [];

    staffData.forEach(async (staffMember) => {
      const { discordId, roleName } = staffMember;
      const discordUserId = discordId;
      const member = interaction.guild.members.cache.get(discordId);

      if (!member) {
        const yourId = '335188615279804419';
        const errorMessage = `${discordId} has DMs off or is not in the guild, so the DM failed to send.`;
        const yourUser = interaction.guild.members.cache.get(yourId);

        if (yourUser) {
          try {
            await yourUser.send(errorMessage);
          } catch (dmError) {
            console.error(`Error sending DM to ${yourId}: ${dmError}`);
          }
        } else {
          console.error(`User with ID ${yourId} not found in the guild.`);
        }

        return;
      }

      if (roleName && roleName.toLowerCase() === 'mod') {
        const roleId = '1157522893052330134';
        const role = interaction.guild.roles.cache.get(roleId);

        if (role) {
            try {
              await member.roles.add(role);
              addedRoles.push(role.name);
              console.log(`Added "Mod" role to user ${discordId}.`);
            } catch (error) {
              console.error(`Error assigning "Mod" role to user ${discordId}: ${error}`);
            }
          } else {
            console.error(`Role with ID ${roleId} not found.`);
          }
        }

      const dmMessage = 'Your Staff Application has been Accepted! Please pay attention here for any DMs.';
      try {
        await member.send(dmMessage);
      } catch (error) {
        const yourId = '335188615279804419';
        const errorMessage = `${discordId} has DMs off, so the DM failed to send.`;
        const yourUser = interaction.guild.members.cache.get(yourId);

        if (yourUser) {
          try {
            await yourUser.send(errorMessage);
          } catch (dmError) {
            console.error(`Error sending DM to ${yourId}: ${dmError}`);
          }
        } else {
          console.error(`User with ID ${yourId} not found in the guild.`);
        }
      }
    });
  },
};
