const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const config = require('../../config.json');
const { Permissions } = require('discord.js');

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

const cooldowns = new Map();

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Syncs your Discord role with your account in the database'),
  async execute(interaction) {
    const discordUserId = interaction.user.id;

    if (cooldowns.has(discordUserId)) {
      const cooldown = cooldowns.get(discordUserId);
      const remainingTime = cooldown - Date.now();

      if (remainingTime > 0) {
        const minutes = Math.ceil(remainingTime / 1000 / 60);
        return interaction.reply(`You are on cooldown. Please wait ${minutes} minutes before running this command again.`);
      }
    }

    const cooldownTime = Date.now() + 30 * 60 * 1000;
    cooldowns.set(discordUserId, cooldownTime);

    await interaction.reply('Checking...');

    const sql = 'SELECT `rank` FROM account_links WHERE discord_user_id = ?';
    connection.query(sql, [discordUserId], (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        cooldowns.delete(discordUserId);
        return interaction.editReply('An error occurred while syncing. Please try again later.');
      }

      if (result.length === 0) {
        cooldowns.delete(discordUserId);
        return interaction.editReply('No account found for your Discord ID.');
      }

      interaction.editReply('Account found! Syncing roles...');

      const ranks = result[0].rank;
      const rankArray = ranks.split(',').map((rank) => rank.trim());

      const guild = interaction.guild;

      const roleMap = {
        'admin': '1130557445169758278',
        'gamemaster': '1131576612563996743',
        'mvp++': 'MVPPLUSPLUS_ROLE_ID',
        'mvp+': 'MVPPLUS_ROLE_ID',
        'mvp': 'MVP_ROLE_ID',
        'vip+': 'VIPPLUS_ROLE_ID',
        'vip': 'VIP_ROLE_ID',
        'youtuber': 'YOUTUBER_ROLE_ID',
        'default': 'DEFAULT_ROLE_ID',
      };

      const roleIds = rankArray.map((rank) => roleMap[rank]).filter(Boolean);

      const staffRoleId = '1130557413989290136';
      if (guild && guild.available) {
        const member = guild.members.cache.get(discordUserId);
        if (member) {
          if (rankArray.includes('admin') || rankArray.includes('gamemaster')) {
            roleIds.push(staffRoleId);
          }

          const addedRoles = [];
          const currentRoles = member.roles.cache.map((role) => role.id);

          for (const roleId of roleIds) {
            if (!currentRoles.includes(roleId)) {
              const role = guild.roles.cache.get(roleId);
              if (role) {
                member.roles.add(role);
                addedRoles.push(role.name);
              }
            }
          }

          const addedRolesString = addedRoles.join(', ');

          interaction.editReply(`Roles synced successfully! Added roles: ${addedRolesString}`);
        } else {
          interaction.editReply('Failed to fetch member from the guild. Please try again later.');
        }
      } else {
        interaction.editReply('The guild is not available. Please try again later.');
      }
    });
  },
};
