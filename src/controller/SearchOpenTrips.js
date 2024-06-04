const moment = require('moment-timezone');
const searchOpenTripModel = require('../models/SearchOpenTripModel');

const searchOpenTrip = async (req, res) => {
    try {
        let { id, date } = req.query;
        
        // If date is null, set it to the current date in Jakarta
        if (!date) {
            date = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
        }
        
        const [data] = await searchOpenTripModel.getOpenTripAvailableByIdAndDate(id, date);
        
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
