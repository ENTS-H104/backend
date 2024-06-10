const express = require('express');
const multer = require('multer');

const UserController = require('../controller/UsersController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

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

// Update Photo Profile - POST
router.put('/update/photo/:user_uid', upload.single('image'), UserController.updatePhotoProfileUser);

// Update Profile - PUT
router.put('/update/:user_uid', UserController.updateProfileUser);


module.exports = router;