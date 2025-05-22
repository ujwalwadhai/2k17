// Checks if user is allowed to visit a restricted route based on role
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
      return res.status(403).send('Forbidden route');
    }

    next();
  };
};

module.exports = hasRole;