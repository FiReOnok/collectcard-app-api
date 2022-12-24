const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'rest-api',
    password: 'cgAe28yC6jTP6V5J',
    database: 'collectcard'
});

module.exports = db;