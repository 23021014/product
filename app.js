const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const session = require('express-session');
const connection = require('./models/db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/stylesheet', express.static(path.join(__dirname, 'stylesheet')));
app.use(session({
    secret: 'your_secret_key', // Replace with a strong, random string
    resave: false,
    saveUninitialized: true
}));




// Modular routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', authRoutes); // Routes related to authentication
app.use('/', productRoutes); // Routes related to products
app.use('/', userRoutes); // Routes related to user actions



// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


