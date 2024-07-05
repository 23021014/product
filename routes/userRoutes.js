const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../models/authMiddleware');
const connection = require('../models/db');


// let products = [
//     { id: 1, name: 'Apples', qty: 100, price: 1.5, imageUrl: "images/kucing.jpg", totalTime: 10, servingSize: 10, ingredients: ['Apples', 'Knife'], preparationSteps: ['Wash the apples', 'Slice the apples'] },
    
// ];


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
            res.status(400).send('Recipe already liked by the user');
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
                // // Optionally, you can render a page or redirect to another route
                // res.render('likes', { recipeID });
            });
        }
    });
    
})

router.post('/unlike', isAuthenticated, (req,res) =>{
    const { recipeID } = req.body;
    const username = req.session.username;

    // Check if the user has liked the recipe to be able to unlike it
    const checkLikeQuery = 'SELECT * FROM liked_recipes WHERE username = ? AND recipeID = ?';
    connection.query(checkLikeQuery, [username, recipeID], (err, checkResults) => {
        if (err) {
            console.error('Error checking like:', err);
            res.status(500).send('Error checking like');
            return;
        }

        if (checkResults.length === 0) {
            // Recipe is not liked by the user
            res.status(400).send('Recipe is not liked by the user');
        } else {
            // Delete from liked_recipes table
            const deleteLikeQuery = 'DELETE FROM liked_recipes WHERE username = ? AND recipeID = ?';
            connection.query(deleteLikeQuery, [username, recipeID], (err, deleteResult) => {
                if (err) {
                    console.error('Error unliking recipe:', err);
                    res.status(500).send('Error unliking recipe');
                    return;
                }
                console.log('Successfully unliked recipe');
                res.status(200).send('Recipe successfully unliked');
            });
        }
    });
    
})

router.get('/likes', isAuthenticated, (req,res) =>{
    const username = req.session.username;

    const sql = 'SELECT * FROM liked_recipes WHERE username = ?';
    //I want to display all the results, so results will only contain recipes that is liked by the username

    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching liked recipes:', err);
            // Handle error, maybe redirect to an error page
            res.redirect('/error');
            return;
        }

        if (results.length > 0) {
            // Optionally, you can reverse the results if needed
            // results.reverse();

            // Assuming you want to fetch details of liked recipes from the 'recipes' table
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

module.exports = router;
