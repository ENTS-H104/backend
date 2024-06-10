const express = require('express');
const multer = require('multer');
const PartnerController = require('../controller/PartnersController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

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

// Update Photo Profile - POST
router.put('/update/photo/:partner_uid', upload.single('image'), PartnerController.updatePhotoProfilePartner);

// Update Profile - PUT
router.put('/update/:partner_uid', PartnerController.updateProfilePartner);


module.exports = router;