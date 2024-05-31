const express = require('express');

const FaqsController = require('../controller/FaqsController')
const router = express.Router();

// Post - create role
router.post('/', FaqsController.createNewFaq);

module.exports = router;