const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost', // Your MySQL host (e.g., 'localhost')
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'recipe' // Your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = connection;