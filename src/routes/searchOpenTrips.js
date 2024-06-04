const express = require('express');

const OpenTrips = require('../controller/SearchOpenTrips')
const router = express.Router();

router.get('/', OpenTrips.searchOpenTrip);
module.exports = router;