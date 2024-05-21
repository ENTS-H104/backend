const moment = require('moment-timezone');

const usersModel = require ('../models/UsersModel')

const getAllUsers = async (req, res) => {
    try {
        const [ data ] = await usersModel.getAllUsers();
        
        // Convert UTC timestamps to UTC+7
        const dataWithLocalTime = data.map(data => ({
            ...data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
            updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
        }));
        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: dataWithLocalTime
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

module.exports = {
    getAllUsers,
}
