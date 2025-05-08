const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Example POST route — Form submission
router.post('/submit', postController.submitForm);


module.exports = router;
