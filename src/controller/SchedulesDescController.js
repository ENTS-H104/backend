const { v4: uuidv4 } = require('uuid');
const SchedulesDescModel = require ('../models/SchedulesDescModel');

const createNewSchedule = async (req, res) => {
    try {
        const { body} = req;
 
        const uuid = uuidv4()
        await SchedulesDescModel.createNewSchedule(body, uuid);

        res.status(201).json({
            status: 201,
            message: 'Schedule description created successfully.',
            data: {
                open_trip_schedule_description_uuid: uuid,
                ...body,
            }
        });
       
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server Error',
            serverMessage: error.message,
        });
    }
};
module.exports = {
    createNewSchedule,
}