const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const onlinePlayers = new Set();
const playerData = {};

let apiKey = '';

function generateAPIKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

apiKey = generateAPIKey();

app.use(bodyParser.json());

function validateAPIKey(req, res, next) {
  const apiKeyHeader = req.header('X-API-Key');
  if (apiKeyHeader !== apiKey) {
    return res.status(403).json({ error: 'Forbidden. Invalid API key.' });
  }
  next();
}

app.get('/player/:playerName', async (req, res) => {
  const playerName = req.params.playerName;
  const isOnline = onlinePlayers.has(playerName);

  const level = playerData[playerName]?.level || 1;
  const rank = playerData[playerName]?.rank;

  try {
    const minotarApiUrl = `https://minotar.net/avatar/${playerName}/100`;
    const response = await fetch(minotarApiUrl);

    if (response.ok) {
      const avatarUrl = minotarApiUrl;
      const playerInfo = {
        playerName: playerName,
        online: isOnline,
        level: level,
        rank: rank,
        avatarUrl: avatarUrl,
        staff: true,
      };

      res.json(playerInfo);
    } else {
      res.status(500).json({ error: 'Failed to fetch player avatar.' });
    }
  } catch (error) {
    console.error('Error fetching player avatar:', error);
    res.status(500).json({ error: 'Failed to fetch player avatar.' });
  }
});

app.post('/player/join', validateAPIKey, (req, res) => {
  const playerName = req.body.playerName;
  onlinePlayers.add(playerName);
  console.log(`Player "${playerName}" joined the server.`);
  res.sendStatus(200);
});

app.post('/player/leave', validateAPIKey, (req, res) => {
  const playerName = req.body.playerName;
  onlinePlayers.delete(playerName);
  console.log(`Player "${playerName}" left the server.`);
  res.sendStatus(200);
});

app.post('/player/level', validateAPIKey, (req, res) => {
  const playerName = req.body.playerName;
  const level = req.body.level;
  playerData[playerName] = { ...playerData[playerName], level: level };
  console.log(`Updated level for player "${playerName}": ${level}`);
  res.sendStatus(200);
});

app.post('/player/rank', validateAPIKey, (req, res) => {
  const playerName = req.body.playerName;
  const rank = req.body.rank;
  playerData[playerName] = { ...playerData[playerName], rank: rank };
  console.log(`Updated rank for player "${playerName}": ${rank}`);
  res.sendStatus(200);
});

app.post('/player/playtime', validateAPIKey, (req, res) => {
  const playerName = req.body.playerName;
  const playtimeMillis = req.body.playtimeMillis;
  playerData[playerName] = { ...playerData[playerName], playtimeMillis: playtimeMillis };
  console.log(`Updated playtime for player "${playerName}": ${playtimeMillis}`);
  res.sendStatus(200);
});

function startApiServer(callback) {
  app.listen(port, () => {
    generateAPIKey
    console.log(`Server running on port ${port} with the api key ${apiKey}`);
    callback();
  });
}

module.exports = {
  startApiServer: startApiServer,
};
