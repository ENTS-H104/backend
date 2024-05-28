const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const PartnerRolesModel = require ('../models/PartnerRolesModel');

const createNewPartnerRoles = async (req, res) => {
    try {
        const { body } = req;

        // Check if name has value
        const partner_role_name = body.partner_role_name;
        if (!partner_role_name) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `partner_role_name` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['partner_role_name', 'description'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `partner_role_name` and `description` only!",
                invalidFields: invalidFields
            });
        }

        const uuid = uuidv4();
        await PartnerRolesModel.createNewPartnerRoles(body, uuid);
        res.status(201).json({
            status: 201,
            message: `Successfully created a role`,
            data: {
                partner_role_uuid: uuid,
                ...body
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}
module.exports = {
    createNewPartnerRoles,
}