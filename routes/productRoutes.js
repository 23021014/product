const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { isAuthenticated } = require('../models/authMiddleware');
const connection = require('../models/db');
const fs = require('fs');


// In-memory data for products
// let products = [
//     { id: 1, name: 'Apples', qty: 100, price: 1.5, imageUrl: "images/kucing.jpg", totalTime: 10, servingSize: 10, ingredients: ['Apples', 'Knife'], preparationSteps: ['Wash the apples', 'Slice the apples'] },
//     { id: 2, name: 'Bananas', qty: 75, price: 0.8, imageUrl: "images/banana.jpg" },
//     { id: 3, name: 'Milk', qty: 50, price: 3.5, imageUrl: "images/milk.jpg" },
//     { id: 4, name: 'Bread', qty: 80, price: 1.5, imageUrl: "images/bread.jpg" }
// ];


// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for CRUD operations
// Route to retrieve and display all products
// router.get('/products', (req, res) => {
//     res.render('index', { products });
// });

router.get('/products', (req, res) => {
    // SQL query to select all recipes
    const username = req.session.username;
    const sql = 'SELECT * FROM recipes WHERE username = ?';

    // Execute the query
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching recipes from MySQL:', err);
            res.render('error', { message: 'Database error. Please try again.' });
        } else {
            // Render the view with the retrieved recipes
            results.reverse();
            res.render('index', { products: results });
        }
    });
});



// Rendering the add product page
router.get('/addProductForm', isAuthenticated, (req, res) => {
    res.render('addProduct');
});


// Route to handle form submission
router.post('/search', isAuthenticated, (req, res) => {
    const searchTerm = req.body.searchTerm;
    // Process the search term here, e.g., query a database or perform some action
    // res.send(`You searched for: ${searchTerm}`);
    //the like query is what makes it flexible
    const sql = "SELECT * FROM recipes where recipeName LIKE ?";

    //advance search
    const searchQuery = `%${searchTerm}%`;

    connection.query(sql, [searchQuery], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            results.reverse();
            res.render('searchFound', { products: results });
        } else {
            res.render('searchNotFound');
        }
    });
});



// Route to get a specific product by ID
router.get('/products/:id', isAuthenticated,  (req, res) => {
    const recipeID = parseInt(req.params.id);
    const sql = `SELECT * FROM recipes WHERE recipeID = ?`;

    connection.query(sql, [recipeID], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            const updateRecipe = results[0]; // Assuming recipeID is unique, take the first result
            res.render('ProductInfo', { updateRecipe });
        } else {
            res.status(404).send('Product not found');
        }
    });
});

// Adding the new product into the database
// router.post('/addProduct', isAuthenticated, (req, res) => {
//     const { name, qty, price } = req.body;
//     const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
//     const newProduct = { id, name, qty: parseInt(qty), price: parseFloat(price) };
//     products.push(newProduct);
//     res.redirect('/products');


// });

// Adding the new product into the database
// Route for handling form submission
router.post('/addProduct', upload.single('image'),(req, res) => {
    // Handle file upload using multer
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Read the uploaded file into a Buffer
    const imgBuffer = req.file.buffer;

    // Extract other form data
    const { name, totalTime, servingSize, ingredients, preparationSteps } = req.body;
    const username = req.session.username;
    console.log(imgBuffer);
    console.log(req.body);
    // Prepare SQL query to insert into the database
    const sql = `INSERT INTO recipes (recipeImage, recipeName, totalTimeEstimated, servingSize, ingredients, preparationSteps, username)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query
    connection.query(sql, [imgBuffer, name, totalTime, servingSize, ingredients.join(', '), preparationSteps.join(', '), username], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Database error. Please try again.');
        }

        console.log('Data inserted successfully.');
        res.redirect('/products');
    });
});


// Update a product by ID - Just to make sure the id exist in the database to perform update
router.get('/products/:id/update', isAuthenticated, (req, res) => {
    const recipeID = parseInt(req.params.id);
    const sql = `SELECT * FROM recipes WHERE recipeID = ?`;

    
    connection.query(sql, [recipeID], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            const updateRecipe = results[0]; // Assuming recipeID is unique, take the first result
            
            res.render('updateProduct', { updateRecipe });
        } else {
            res.status(404).send('Product not found');
        }
    });
});

// Helper function to get the existing image
const getExistingImage = (recipeID) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT recipeImage FROM recipes WHERE recipeID = ?', [recipeID], (err, result) => {
            if (err) {
                return reject(err);
            }
            if (result.length > 0) {
                return resolve(result[0].recipeImage);
            }
            return reject(new Error('Product not found'));
        });
    });
};

// Adding the new product into the database
router.post('/products/:id/update', isAuthenticated, upload.single('image'), async (req, res) => {
    const recipeID = req.params.id;
    const { name, totalTime, servingSize, ingredients, preparationSteps } = req.body;
    let image;

    try {
        if (req.file) {
            image = req.file.buffer;
        } else {
            // If no new image is uploaded, fetch existing image data
            image = await getExistingImage(recipeID);
        }

        const updateFields = {
            recipeName: name || null,
            totalTimeEstimated: totalTime || null,
            servingSize: servingSize || null,
            ingredients: Array.isArray(ingredients) ? ingredients.join(', ') : ingredients || null,
            preparationSteps: Array.isArray(preparationSteps) ? preparationSteps.join(', ') : preparationSteps || null,
            recipeImage: image
        };

        const query = `
            UPDATE recipes
            SET ?
            WHERE recipeID = ?
        `;

        connection.query(query, [updateFields, recipeID], (err, result) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).send('Error updating product');
            }
            res.redirect('/products');
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred');
    }
});


// Delete a product by ID
router.get('/products/:id/delete', isAuthenticated, (req, res) => {
    const recipeID = parseInt(req.params.id);
    // products = products.filter(product => product.id !== recipeID);

    // SQL DELETE query
    const sql = `DELETE FROM recipes WHERE recipeID = ?`;


    connection.query(sql, [recipeID], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }
        console.log('Deleted product with ID:', recipeID);
        res.redirect('/products');
    });
});


router.get('/home', isAuthenticated, (req,res) => {
    const sql = 'SELECT * FROM recipes';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            results.reverse(); // to make sure last product will be the first
            res.render('homepage', { updateRecipe:results , username: req.session.username});
        } else {
            res.render('homepage', { updateRecipe:results , username: req.session.username});
        }
    });
    
});



module.exports = router;

