function calculateExpRequiredForLevel(level) {
    const maxLevel = 200;
    const baseExp = 10;
    return Math.floor(baseExp * Math.pow(level, 1.5));
  }
  
  module.exports = calculateExpRequiredForLevel;
  