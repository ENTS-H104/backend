const express = require('express');
const PaymentGatewayController = require('../controller/PaymentGatewayController')
const router = express.Router();

router.post('/create', PaymentGatewayController.createPaymentGateway);
router.get('/get-all', PaymentGatewayController.getAllPayment);
module.exports = router;