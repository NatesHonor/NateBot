const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageActionRow, MessageButton } = require('discord.js');
const mysql = require('mysql');
const config = require('./config.json');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

function calculateExpRequiredForLevel(level) {
  const maxLevel = 200;
  const baseExp = 100;
  return Math.floor(baseExp * Math.pow(level, 1.5));
}

async function updateUserExpAndLevel(userId, expToAdd) {
  const userData = await getUserData(userId);
  const currentLevel = userData.level || 1;
  const currentExp = userData.exp || 0;

  let updatedExp = currentExp + expToAdd;
  let updatedLevel = currentLevel;

  while (updatedExp >= calculateExpRequiredForLevel(updatedLevel + 1)) {
    updatedExp -= calculateExpRequiredForLevel(updatedLevel + 1);
    updatedLevel++;
    if (updatedLevel >= 200) {
      break;
    }
  }

  await updateUserLevelData(userId, updatedLevel, updatedExp);
}

async function getUserData(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user_levels WHERE user_id = ?';
    pool.query(sql, [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0 ? result[0] : {});
      }
    });
  });
}

async function updateUserLevelData(userId, level, exp) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO user_levels (user_id, level, exp) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE level = ?, exp = ?';
    const values = [userId, level, exp, level, exp];
    pool.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

client.once(Events.ClientReady, () => {
  console.log('Ready!');
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.author.bot) {
    updateUserExpAndLevel(message.author.id, 1);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, { updateUserExpAndLevel });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(config.token);
