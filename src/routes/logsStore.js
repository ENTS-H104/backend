const express = require('express');
const FirestoreController = require('../controller/FirestoreController')
const router = express.Router();

router.post('/create-mountain-logs', FirestoreController.recordMountainClick);
router.get('/get-mountain-logs/:user_uid', FirestoreController.getMountainBasedUserUuid);
router.post('/create-opentrip-logs', FirestoreController.recordOpenTripClick);
router.get('/get-opentrip-logs/:user_uid', FirestoreController.getOpenTripBasedUserUuid);
module.exports = router;