const express = require('express');

const UserController = require('../controller/UsersController')
const router = express.Router();

// Read - Get
router.get('/', UserController.getAllUsers);

module.exports = router;