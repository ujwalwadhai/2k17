const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');

// Example GET route — Home Page
router.get('/', getController.indexPage);

router.get('/login', getController.login);

router.get('/create-account', getController.createAccount);

router.get('/login/email', getController.emailLogin);

module.exports = router;
