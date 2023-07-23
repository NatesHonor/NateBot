const mysql = require('mysql');
const config = require('../../config.json');
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

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

    console.log('Connected to the database!');

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
