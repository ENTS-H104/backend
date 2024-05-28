const express = require('express');

const PartnerRolesController = require('../controller/PartnerRolesController')
const router = express.Router();

// Post - create role
router.post('/', PartnerRolesController.createNewPartnerRoles);

module.exports = router;