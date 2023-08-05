const pool = require('../database');

async function setUserLevelData(userId, newLevel) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE user_levels SET level = ? WHERE user_id = ?';
    pool.query(sql, [newLevel, userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = setUserLevelData;
