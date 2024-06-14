const express = require('express');

const OpenTrips = require('../controller/SearchOpenTrips')
const router = express.Router();

router.get('/', OpenTrips.searchOpenTrip);
router.get('/ot-by-mountain', OpenTrips.getOpenTripByMountain);
module.exports = router;