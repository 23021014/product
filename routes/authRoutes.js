const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const { isAuthenticated } = require('../models/authMiddleware');

// Routes for user login
router.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/home'); // Redirect to home if already logged in
    } else {
        res.render('login');
    }
});


//previous implementation of login
// router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     console.log(`Username: ${username}, Password: ${password}`);
//     res.redirect('/home');
// });

router.post('/loginAccount', (req, res) => {
    const { username, password } = req.body;
    //take the username and password to check if its valid
    const sql = 'SELECT * FROM account WHERE username = ? AND password = ?';
    connection.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.render('login', { error: "Database error. Please try again." });
        } else {
            if (results.length > 0) {
                // User authenticated successfully
                req.session.username = username;
                // req.session.password = password;
                req.session.loggedIn = true; 
                res.redirect('/home');
            } else {
                // Invalid credentials
                res.render('login', { error: "Invalid username or password. Please try again." });
            }
        }
    });
});

//register page
router.get('/register', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/home'); // Redirect to home if already logged in
    } else {
        res.render('register');
    }
});

//register service (creating a new account)
router.post('/registerAccount', (req, res) => {
    //to save this into the database
    //lets get the users username and password ifrst
    const { username, password } = req.body;
    //query for sql database
    const sql = 'INSERT INTO account (username, password) VALUES (?, ?)';
    connection.query(sql, [username, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Handle duplicate entry error (username already exists)
                console.error('Username already exists:', username);
                return res.render('register', { error: "Username already exists. Please choose another username." });
            } else {
                // Handle other database errors
                console.error('Error saving data to MySQL:', err);
                return res.render('register', { error: "Database error. Please try again." });
            }
        } else {
            console.log('User registered successfully.');
            req.session.username = username;
            req.session.loggedIn = true; 
            res.redirect('/home');
        }
    });
    

    
});


router.get('/logout',(req,res)=>{
    req.session.destroy( err =>{
        if(err){
            console.err("Error destroying the session: ",err);
        }
        res.redirect('/');
    });
})

module.exports = router;