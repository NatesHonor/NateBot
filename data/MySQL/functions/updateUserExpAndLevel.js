const { pool } = require('../database');

const calculateExpRequiredForLevel = require('./calculateExpRequiredForLevel');
const getUserData = require('./getUserData');
const updateUserLevelData = require('./updateUserLevelData');

async function updateUserExpAndLevel(userId, expToAdd) {
  try {
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

    return { level: updatedLevel, exp: updatedExp };
  } catch (error) {
    console.error('Error updating user exp and level:', error);
    throw error;
  }
}

module.exports = updateUserExpAndLevel;
