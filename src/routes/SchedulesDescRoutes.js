const express = require('express');

const SchedulesDescController = require('../controller/SchedulesDescController')
const router = express.Router();

// Post - create role
router.post('/', SchedulesDescController.createNewSchedule);

module.exports = router;