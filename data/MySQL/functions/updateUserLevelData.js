const pool = require('../database');

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

module.exports = updateUserLevelData;
