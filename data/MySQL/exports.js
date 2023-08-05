const mysql = require('mysql');
const config = require('../../config.json');
const calculateExpRequiredForLevel = require('./functions/calculateExpRequiredForLevel');
const getUserData = require('./functions/getUserData');
const updateUserLevelData = require('./functions/updateUserLevelData');

module.exports = {
    calculateExpRequiredForLevel,
    getUserData,
    updateUserLevelData,
  };
  