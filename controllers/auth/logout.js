const logout = (req, res) => {
  req.logout(err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Logout failed');
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
};

module.exports = logout;