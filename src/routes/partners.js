const express = require('express');
const multer = require('multer');
const PartnerController = require('../controller/PartnersController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


// Read - GET
router.get('/', PartnerController.getAllPartners);

// Admin
router.get('/admin', PartnerController.getAllMitraNeedVerification);
router.put('/admin', PartnerController.changeMitraStatus);

// Register - POST
router.post('/register', PartnerController.registerPartners);

// Register Admin - POST
router.post('/register/admin', PartnerController.registerPartnersAdmin);

// Login - POST 
router.post('/login', PartnerController.loginPartners);

// Logout - GET
router.get('/logout', verifyToken, PartnerController.logoutPartners);

// Get Current User - Get 
router.get('/get-current-user', verifyToken, PartnerController.currentPartners);

// Forgot Password - POST
router.post('/forgot-password', PartnerController.forgotPasswordPartners);

// Update Photo Profile - POST
router.put('/update/photo', verifyToken, upload.single('image'), PartnerController.updatePhotoProfilePartner);

// Update Profile - PUT
router.put('/update', verifyToken, PartnerController.updateProfilePartner);

const uploadFields = [
    { name: 'image_ktp', maxCount: 1 },
    { name: 'image_selfie_and_ktp', maxCount: 1 }
  ];

router.put('/verification', upload.fields(uploadFields), PartnerController.MitraVerification);

module.exports = router;