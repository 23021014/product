const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const session = require('express-session');
const connection = require('./models/db'); //database connection

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //json
app.set('view engine', 'ejs'); //ejs template
app.use(express.static(path.join(__dirname, 'public')));  //static files form public 'directory'
app.use('/stylesheet', express.static(path.join(__dirname, 'stylesheet'))); //link css
//startup session
app.use(session({
    secret: 'your_secret_key', // Replace with a strong, random string
    resave: false,
    saveUninitialized: true
}));

// import routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

//use routes
app.use('/', authRoutes); // Routes related to authentication (authRoutes)
app.use('/', productRoutes); // Routes related to products (productRoutes)
app.use('/', userRoutes); // Routes related to user actions (userRoutes)

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


