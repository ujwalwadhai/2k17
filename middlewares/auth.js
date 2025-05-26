// Checks if user is logged in
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

function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect(`/login?url=${req.originalUrl}`);
    }

    var userRole = req.user.role;
    if(userRole === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.redirect('/login');
    }

    next();
  };
};


module.exports = { isLoggedIn, hasRole }