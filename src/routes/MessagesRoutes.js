const express = require('express');

const MessagesController = require('../controller/MessagesController')
const router = express.Router();

router.post('/', MessagesController.getMessageUserSide);

router.get('/:user_uid', MessagesController.getAllMessageUserSide);

router.post('/users', MessagesController.UserSendMessage);

router.post('/partners', MessagesController.PartnerSendMessage);

module.exports = router;