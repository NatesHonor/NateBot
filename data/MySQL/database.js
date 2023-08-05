const mysql = require('mysql');
const config = require('../../config.json');
const calculateExpRequiredForLevel = require('./functions/calculateExpRequiredForLevel');
const getUserData = require('./functions/getUserData');
const updateUserLevelData = require('./functions/updateUserLevelData');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

pool.on('acquire', () => {
    console.log('Pool started');
  });
  

module.exports = pool;
