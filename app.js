const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); 

// In-memory data for products
let products = [
  { id: 1, name: 'Apples', qty: 100, price: 1.5 , imageUrl : "images/kucing.jpg"},
  { id: 2, name: 'Bananas', qty: 75, price: 0.8 , imageUrl : "images/banana.jpg"},
  { id: 3, name: 'Milk', qty: 50, price: 3.5 , imageUrl : "images/milk.jpg"},
  { id: 4, name: 'Bread', qty: 80, price: 1.5 , imageUrl : "images/bread.jpg"}
];

// Routes for CRUD operations
// Route to retrieve and display all products
app.get('/products', (req, res) => {
    res.render('index', { products });
});

// Route to get a specific product by ID
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(product => product.id === productId);

    if (product) {
        res.render('productInfo', { product });
    } else {
        res.status(404).send('Recipe not found');
    }
});

// Add a new product form
app.get('/addProductForm', (req, res) => {
    res.render('addProduct');
});

// Add a new product
app.post('/products', (req, res) => {
    const { name, qty, price } = req.body;
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    const newProduct = { id, name, qty: parseInt(qty), price: parseFloat(price) };
    products.push(newProduct);
    res.redirect('/products');
});

// Update a product by ID - First find the product
app.get('/products/:id/update', (req, res) => {
    const productId = parseInt(req.params.id);
    const updateProduct = products.find(product => product.id === productId);

    if (updateProduct) {
        res.render('updateProduct', { updateProduct });
    } else {
        res.status(404).send('Product not found');
    }
});

// Update a product by ID - Update the product information
app.post('/products/:id/update', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, qty, price } = req.body;
    const updatedProduct = { id: productId, name, qty: parseInt(qty), price: parseFloat(price) };
    products = products.map(product => product.id === productId ? updatedProduct : product);
    res.redirect('/products');
});

// Delete a product by ID
app.get('/products/:id/delete', (req, res) => {
    const productId = parseInt(req.params.id);
    products = products.filter(product => product.id !== productId);
    res.redirect('/products');
});

// Routes for user login
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    res.redirect('/products');
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


