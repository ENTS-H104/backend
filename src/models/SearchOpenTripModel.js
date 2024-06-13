const dbPool = require('../config/database')

const getOpenTripAvailableByIdAndDate = (mountain_id, from_date, to_date) => {
    const SQLQuery = `SELECT 
                            ot.open_trip_uuid,
                            ot.name,
                            ot.image_url,
                            ot.price,
                            mountain.name AS mountain_name,
                            mountain.mountain_uuid,
                            COALESCE(SUM(tl.total_participant), 0) AS total_participants
                        FROM 
                            open_trips ot 
                        JOIN 
                            open_trip_schedules ots ON ot.open_trip_schedule_uuid = ots.open_trip_schedule_uuid 
                        JOIN 
                            mountains mountain ON ot.mountain_uuid = mountain.mountain_uuid
                        LEFT JOIN 
                            transaction_logs tl ON ot.open_trip_uuid = tl.open_trip_uuid OR tl.status_accepted = "ACCEPTED" OR tl.status_payment="PENDING"
                        WHERE 
                            ot.mountain_uuid = ? 
                            AND ots.start_date >= ? 
                            AND ots.start_date <= ?
                        GROUP BY 
                            ot.open_trip_uuid`;

    return dbPool.execute(SQLQuery, [mountain_id, from_date, to_date]);
}

module.exports = {
    getOpenTripAvailableByIdAndDate,
}