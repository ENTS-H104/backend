const TransactionController = require('../controller/TransactionController')
const express = require('express');
const router = express.Router();

router.post('/create', TransactionController.createTransaction);
router.post('/midtrans-notification', TransactionController.handleMidtransNotification);
router.get('/get-histories', TransactionController.getHistoriesTransaction);
router.post('/update-status-accepted', TransactionController.updateStatusAccepted);
router.get('/get-detail_transaction/:transaction_uuid', TransactionController.getDetailTransaction);
module.exports = router;