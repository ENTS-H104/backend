const express = require('express');

const UserRolesController = require('../controller/UserRolesController')
const router = express.Router();

// Get - all
router.get('/', UserRolesController.getAllUserRoles);

// Get - by id
router.get('/:user_role_uuid', UserRolesController.getUserRolesById);

// Post - create role
router.post('/', UserRolesController.createNewUserRoles);

// PUT - update role
router.put('/:user_role_uuid', UserRolesController.updateUserRoles);

// PUT - update role
router.delete('/:user_role_uuid', UserRolesController.deleteUserRoles);



module.exports = router;