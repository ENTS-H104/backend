const express = require('express');

const OpenTrips = require('../controller/OpenTripsController')
const router = express.Router();

// Post - create role
router.post('/', OpenTrips.createNewOpenTrips);

module.exports = router;