const express = require('express');

const UserController = require('../controller/UsersController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

// Read - GET
router.get('/', UserController.getAllUsers);

// Register - POST
router.post('/register', UserController.registerUsers);

// Login - POST 
router.post('/login', UserController.loginUsers);

// Logout - GET
router.get('/logout', verifyToken, UserController.logoutUsers);

// Get Current User - Get 
router.get('/get-current-user', verifyToken, UserController.currentUsers);

// Forgot Password - POST
router.post('/forgot-password', UserController.forgotPasswordUsers);


module.exports = router;