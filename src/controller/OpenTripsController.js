const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const OpenTripsModel = require ('../models/OpenTripsModel');

const createNewOpenTrips = async (req, res) => {
    try {
        const { body } = req;

        // Check if name has value
        const name = body.name;

        if (!name) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `name` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['mountain_uuid', 'partner_uid', 'name', 'description', 'policy'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found",
                invalidFields: invalidFields
            });
        }

        const uuid = uuidv4();
        await OpenTripsModel.createNewOpenTrips(body, uuid);
        res.status(201).json({
            status: 201,
            message: `Successfully created a role`,
            data: {
                open_trip_uuid: uuid,
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
    createNewOpenTrips,
}