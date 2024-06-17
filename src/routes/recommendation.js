const RecommenderController = require('../controller/RecommendationController');
const express = require('express');
const router = express.Router();

router.get('/mountain/:user_uid', RecommenderController.getMountainRecommendation);
router.get('/open-trip/:user_uid', RecommenderController.getOpenTripsRecommendation);
module.exports = router;