const pool  = require('../database')

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

module.exports = getUserData;
