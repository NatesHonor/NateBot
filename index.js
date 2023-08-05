const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const getUserData = require('./data/MySQL/functions/getUserData');
const updateUserLevelData = require('./data/MySQL/functions/updateUserLevelData');
const updateUserExpAndLevel = require('./data/MySQL/functions/updateUserExpAndLevel')
require('events').EventEmitter.defaultMaxListeners = 15;

const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ], 
});

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

function startBot() {
  client.once(Events.ClientReady, () => {
    console.log('Ready!');
  });

  client.on(Events.MessageCreate, async (message) => {
    if (!message.author.bot) {
      const userData = await getUserData(message.author.id);
      let user;
      console.log(message.author.id);
      if (!userData || Object.keys(userData).length === 0) {
        await updateUserLevelData(message.author.id, 1, 0);
  
        user = client.users.cache.find(message.author.id);
  
        let levelingChannel = client.channels.cache.find((channel) => channel.name === config.levelingChannel);
        console.log(`levelingChannel: ${levelingChannel}`);
  
        if (!levelingChannel) {
          console.log('Leveling channel not found');
        }
      }
      user = client.users.cache.get(message.author.id);
      const expToAdd = 1;
      const { level: updatedLevel } = await updateUserExpAndLevel(message.author.id, expToAdd);
  
      if (updatedLevel > userData.level) {
        let levelingChannel = client.channels.cache.find((channel) => channel.name === config.levelingChannel);
  
        try {
          if (!levelingChannel) {
            console.log('Leveling channel not found');
          } else {
            console.log('Leveling channel found');
            levelingChannel.send(`${user}, Congratulations! You are now level ${updatedLevel}!`);
          }
        } catch (error) {
          console.error('Error sending leveling message:', error);
        }
      }
    }
  });
  

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      if (interaction.commandName === 'level') {
        await command.execute(interaction, { getUserData });
      } else {
        await command.execute(interaction, { updateUserExpAndLevel });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });

  client.login(config.token);
}

startBot();

