const express = require('express');
const multer = require('multer');

const OpenTripsController = require('../controller/OpenTripsController')
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get('/', OpenTripsController.getAllOpenTrips);

router.get('/:open_trip_uuid', OpenTripsController.getAllOpenTripsById);

router.get('/partners/:partner_uid', OpenTripsController.getPartnerProfile);

router.post('/', upload.single('image'), OpenTripsController.createNewOpenTrips);

module.exports = router;