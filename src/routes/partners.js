const express = require('express');

const PartnerController = require('../controller/PartnersController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

// Read - GET
router.get('/', PartnerController.getAllPartners);

// Register - POST
router.post('/register', PartnerController.registerPartners);

// Login - POST 
router.post('/login', PartnerController.loginPartners);

// Logout - GET
router.get('/logout', verifyToken, PartnerController.logoutPartners);

// Get Current User - Get 
router.get('/get-current-user', verifyToken, PartnerController.currentPartners);

// Forgot Password - POST
router.post('/forgot-password', PartnerController.forgotPasswordPartners);


module.exports = router;