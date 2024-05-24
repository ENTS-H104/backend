const express = require('express');
const multer = require('multer');
const MountainsController = require('../controller/MountainsController')
const router = express.Router();

// Read - Get
router.get('/', MountainsController.getAllMountains);
const upload = multer({ storage: multer.memoryStorage() });
router.post('/', upload.single('image'), MountainsController.uploadMountain);
module.exports = router;