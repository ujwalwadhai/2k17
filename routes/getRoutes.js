const express = require('express');
const router = express.Router();
const getController = require('../controllers/getController');

// Example GET route — Home Page
router.get('/', getController.home);


module.exports = router;
