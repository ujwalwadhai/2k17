var PreUsers = require('../models/PreUser');

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

exports.donate = (req, res) => {
  res.render('pages/donate');
}

exports.members = async (req, res) => {
  var members = await PreUsers.find({});
    res.render('pages/members', {members});
  }