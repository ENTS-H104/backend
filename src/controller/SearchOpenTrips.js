const moment = require('moment-timezone');
const searchOpenTripModel = require('../models/SearchOpenTripModel');

const searchOpenTrip = async (req, res) => {
    try {
        let { id, from_date, to_date } = req.query;
        
        // If date is null, set it to the current date in Jakarta
        if (!id || !from_date || !to_date) {
            return res.status(400).json({
                status: 400,
                message: 'Missing required fields',
                open  
              });
        }
        
        const [data] = await searchOpenTripModel.getOpenTripAvailableByIdAndDate(id, from_date, to_date);
        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        });
    }
};

module.exports = {
    searchOpenTrip
};
