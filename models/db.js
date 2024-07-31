const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'sql.freedb.tech', // Your MySQL host (e.g., 'localhost')
    user: 'freedb_recipedb', //  MySQL username
    password: 'Bxc?$6zNFnn2FwR', //  MySQL password
    database: 'freedb_recipedb', // database name
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = connection;