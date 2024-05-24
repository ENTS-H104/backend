const express = require('express');

const UserController = require('../controller/UsersController')
const router = express.Router();

// Read - GET
router.get('/', UserController.getAllUsers);

// Register - POST
router.post('/register', UserController.registerUsers);

// Login - POST 
router.post('/login', UserController.loginUsers);

// Get Current User - Get 
router.get('/get-current-user', UserController.currentUsers);

// Logout - GET
router.get('/logout', UserController.logoutUsers);

// Forgot Password - POST
router.post('/forgot-password', UserController.forgotPasswordUsers);


module.exports = router;