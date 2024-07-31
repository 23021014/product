// Middleware function to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    // Check if user is logged in
    if (req.session.loggedIn) {
        // User is authenticated, proceed to next middleware or route handler
        next();
    } else {
        // User is not logged in
        // Allow access to '/' and '/register' routes
        if (req.originalUrl === '/' || req.originalUrl === '/register') {
            next();
        } else {
            // Redirect to login page for other routes
            res.redirect('/');
        }
    }
};

// export isAuthenticated so that im able to import in routes folder
module.exports = { isAuthenticated };