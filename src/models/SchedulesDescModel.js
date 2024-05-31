const dbPool = require('../config/database')

const createNewSchedule = async (body, uuid) => {

    const SQLQuery = `INSERT INTO open_trip_schedule_descriptions (open_trip_schedule_description_uuid, open_trip_uuid, day, description)
                      VALUES (?, ?, ?, ?)`
    
    const values = [
            uuid,
            body.open_trip_uuid,
            body.day,
            body.description,
    ]

    return dbPool.execute(SQLQuery, values);
}

module.exports = {
    createNewSchedule,
}