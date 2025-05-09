exports.home = (req, res) => {
  //res.render('home', { title: 'Home Page' });
  res.send('Hello World');
};
  
exports.login = (req, res) => {
  res.render('pages/login', { title: 'Login Page' });
}

exports.createAccount = (req, res) => {
  res.render('pages/signup', { title: 'Create Account Page' });
}