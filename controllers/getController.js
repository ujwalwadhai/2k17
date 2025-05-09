exports.indexPage = (req, res) => {
  res.render('pages/index');
};
  
exports.login = (req, res) => {
  res.render('pages/login');
}

exports.createAccount = (req, res) => {
  res.render('pages/signup');
}

exports.emailLogin = (req, res) => {
  res.render('pages/email-login');
}