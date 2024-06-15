const express = require('express');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken')

const OpenTripsController = require('../controller/OpenTripsController')
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



router.get('/', OpenTripsController.getAllOpenTrips);

router.get('/:open_trip_uuid', verifyToken, OpenTripsController.getAllOpenTripsById);

router.get('/partners/:partner_uid', OpenTripsController.getPartnerProfile);

router.post('/', upload.single('image'), OpenTripsController.createNewOpenTrips);

router.get('/get-open-trip/rec', OpenTripsController.getAllOpenTripsforRec);

module.exports = router;