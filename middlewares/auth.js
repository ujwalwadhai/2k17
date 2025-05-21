function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    var exclude = ['/login', '/signup', '/email-login', '/forgot-password', '/reset-password', '/donate', '/logout', '/home']
    if(exclude.includes(req.originalUrl)){
        res.redirect('/login');
    } else {
        res.redirect(`/login?url=${req.originalUrl}`);
    }
}

module.exports = { isLoggedIn }