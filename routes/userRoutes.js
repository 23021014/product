const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../models/authMiddleware');
const connection = require('../models/db');

//Add a recipe to the user's liked recipes 
router.post('/addIntoLike', isAuthenticated, (req,res) =>{
    const { recipeID } = req.body;
    const username = req.session.username; 
    console.log("test"); 
    // Check if the user has already liked the recipe to avoid duplicate likes
    const checkLikeQuery = 'SELECT * FROM liked_recipes WHERE username = ? AND recipeID = ?';
    connection.query(checkLikeQuery, [username, recipeID], (err, checkResults) => {
        if (err) {
            console.error('Error checking like:', err);
            res.status(500).send('Error checking like');
            return;
        }

        if (checkResults.length > 0) {
            // User has already liked this recipe
            // res.status(400).send('Recipe already liked by the user');
            res.redirect('/home');
        } else {
            // Insert into liked_recipes table
            const insertLikeQuery = 'INSERT INTO liked_recipes (username, recipeID) VALUES (?, ?)';
            connection.query(insertLikeQuery, [username, recipeID], (err, insertResult) => {
                if (err) {
                    console.error('Error inserting liked recipe:', err);
                    res.status(500).send('Error inserting liked recipe');
                    return;
                }
                console.log("Succesfully liked!")
                res.redirect('/home');
            });
        }
    });
    
})

// Unlike a previously liked recipe
router.post('/unlike', isAuthenticated, (req, res) => {
    const { recipeID } = req.body;
    const username = req.session.username;

    // Check if the user has liked the recipe to be able to unlike it
    const checkLikeQuery = 'SELECT * FROM liked_recipes WHERE username = ? AND recipeID = ?';
    connection.query(checkLikeQuery, [username, recipeID], (err, checkResults) => {
        if (err) {
            console.error('Error checking like:', err);
            res.status(500).redirect('/error'); // Redirect to an error page
            return;
        }

        if (checkResults.length === 0) {
            // Recipe is not liked by the user
            res.status(400).redirect('/recipes'); // Redirect back to recipes page
        } else {
            // Delete from liked_recipes table
            const deleteLikeQuery = 'DELETE FROM liked_recipes WHERE username = ? AND recipeID = ?';
            connection.query(deleteLikeQuery, [username, recipeID], (err, deleteResult) => {
                if (err) {
                    console.error('Error unliking recipe:', err);
                    res.status(500).redirect('/error'); // Redirect to an error page
                    return;
                }
                console.log('Successfully unliked recipe');
                res.redirect('/likes'); // Redirect back to recipes page
            });
        }
    });
});

// Display all liked recipes for the logged-in user
router.get('/likes', isAuthenticated, (req,res) =>{
    const username = req.session.username;
    const sql = 'SELECT * FROM liked_recipes WHERE username = ?';

    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching liked recipes:', err);
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            // Get details of liked recipes from the recipes table
            const recipeIDs = results.map(result => result.recipeID);
            const getRecipesQuery = 'SELECT * FROM recipes WHERE recipeID IN (?)';
            
            connection.query(getRecipesQuery, [recipeIDs], (err, likedRecipes) => {
                if (err) {
                    console.error('Error fetching liked recipes details:', err);
                    res.redirect('/error');
                    return;
                }
                console.log(likedRecipes.length);
                // Render the likes page with the liked recipes details
                res.render('likes', { products: likedRecipes});
            });
        } else {
            // No liked recipes found for the user
            likedRecipes = {};
            res.render('likes', { products: likedRecipes});
        }
    });
})

//export to the router so that its importable in appjs
module.exports = router;
