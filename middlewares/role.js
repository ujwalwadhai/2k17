module.exports = function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect(`/login?url=${req.originalUrl}`);
    }

    const userRole = req.user.role;
    if(userRole === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send('Forbidden route');
    }

    next();
  };
};
