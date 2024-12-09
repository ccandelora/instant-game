const { Pool } = require('pg');

    const pool = new Pool({
      user: 'your_db_user',
      host: 'localhost',
      database: 'instant_arcade',
      password: 'your_db_password',
      port: 5432,
    });

    module.exports = {
      query: (text, params) => pool.query(text, params),
    };
