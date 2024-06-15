const express = require('express');
const multer = require('multer');
const MountainsController = require('../controller/MountainsController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Read - Get
router.get('/', MountainsController.getAllMountains);
router.get('/:id', verifyToken, MountainsController.getMountainWeatherById);
const upload = multer({ storage: multer.memoryStorage() });
router.post('/', upload.single('image'), MountainsController.uploadMountain);
module.exports = router;