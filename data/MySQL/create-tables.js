const mysql = require('mysql');
const config = require('../../config.json');

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
});

function createTables() {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
      }
  
      const tables = [
        {
          name: 'reports',
          query: `CREATE TABLE IF NOT EXISTS reports (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  platform VARCHAR(255) NOT NULL,
                  reporter_id VARCHAR(255) NOT NULL,
                  user VARCHAR(255) NOT NULL,
                  reason TEXT NOT NULL,
                  evidence TEXT,
                  report_key VARCHAR(36) NOT NULL UNIQUE,
                  claimed TINYINT(1) DEFAULT 0
                )`,
        },
        {
          name: 'tickets',
          query: `CREATE TABLE IF NOT EXISTS tickets (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id VARCHAR(255) NOT NULL,
                  guild_id VARCHAR(255) NOT NULL,  -- Add the guild_id column
                  channel_id VARCHAR(255) NOT NULL,
                  message TEXT NOT NULL,
                  is_closed TINYINT(1) DEFAULT 0
                )`,
        },
      ];
  
      tables.forEach((table) => {
        connection.query(table.query, (err) => {
          if (err) {
            console.error(`Error creating table ${table.name}:`, err);
          } else {
            console.log(`Table ${table.name} created successfully.`);
          }
        });
      });
  
      connection.end();
    });
  }
  
  module.exports = createTables;
