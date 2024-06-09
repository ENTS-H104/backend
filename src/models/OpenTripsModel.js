const dbPool = require('../config/database')

const getAllMountainByOpenTrip = (mountain_uuid) => {
    const SQLQuery = `SELECT DISTINCT 
                        ot.mountain_uuid,
                        m.name,
                        m.image_url,
                        m.gmaps
                      FROM open_trips ot 
                      RIGHT JOIN mountains m ON ot.mountain_uuid = m.mountain_uuid
                      WHERE m.mountain_uuid LIKE '%${mountain_uuid}%'`
    return dbPool.execute(SQLQuery);
}

const getMitraByOpenTrip = (partner_uid) => {
    const SQLQuery = `SELECT DISTINCT 
                        ot.partner_uid,
                        partner.username,
                        partner.image_url
                      FROM open_trips ot 
                      RIGHT JOIN partners partner ON ot.partner_uid = partner.partner_uid
                      WHERE partner.partner_uid LIKE '%${partner_uid}%'`
    return dbPool.execute(SQLQuery);
}

const getScheduleByOpenTrip = (open_trip_schedule_uuid) => {
    const SQLQuery = `SELECT DISTINCT 
                        ot.open_trip_schedule_uuid,
                        schedule.start_date,
                        schedule.end_date,
                        schedule.start_time,
                        schedule.end_time,
                        schedule.total_day
                      FROM open_trips ot 
                      RIGHT JOIN open_trip_schedules schedule ON ot.open_trip_schedule_uuid = schedule.open_trip_schedule_uuid
                      WHERE schedule.open_trip_schedule_uuid LIKE '%${open_trip_schedule_uuid}%'`
    return dbPool.execute(SQLQuery);
}

const getRundownByOpenTrip = (open_trip_uuid) => {
    const SQLQuery = `SELECT day, description FROM open_trip_schedule_descriptions
                      WHERE open_trip_uuid LIKE '%${open_trip_uuid}%'
                      ORDER BY day ASC`;
    return dbPool.execute(SQLQuery);
}

const getFaqByOpenTrip = (open_trip_uuid) => {
    const SQLQuery = `SELECT description FROM open_trip_faqs
                      WHERE open_trip_uuid LIKE '%${open_trip_uuid}%'`;
    return dbPool.execute(SQLQuery);
}

const getAllOpenTrips = () => {
    const SQLQuery = `SELECT * FROM open_trips`;
    return dbPool.execute(SQLQuery);
}

const getAllOpenTrips2 = () => {
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
                        GROUP BY 
                            ot.open_trip_uuid`;
    return dbPool.execute(SQLQuery);
}

const getAllOpenTripsById = (open_trip_uuid) => {
    const SQLQuery = `SELECT * FROM open_trips WHERE open_trip_uuid LIKE '%${open_trip_uuid}%'`;
    return dbPool.execute(SQLQuery);
}

const getPartnerProfile = (partner_uid) => {
    const SQLQuery = `SELECT * FROM partners WHERE partner_uid LIKE '%${partner_uid}%'`;
    return dbPool.execute(SQLQuery);
}

const getPartnerOpenTrip = (partner_uid) => {
    const SQLQuery = `SELECT 
                            ot.open_trip_uuid,
                            ot.mountain_uuid,
                            ot.name as open_trip_name,
                            ot.image_url,
                            ot.price,
                            ot.min_people,
                            ot.max_people,
                            ot.price,
                            m.name as mountain_name,
                            m.image_url,
                            m.gmaps
                        FROM open_trips ot RIGHT JOIN mountains m ON ot.mountain_uuid = m.mountain_uuid WHERE partner_uid LIKE '%${partner_uid}%'`;
    return dbPool.execute(SQLQuery);
}

const getPartnerOpenTrip2 = (partner_uid) => {
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
                        WHERE ot.partner_uid LIKE '%${partner_uid}%'
                        GROUP BY 
                            ot.open_trip_uuid`;
    return dbPool.execute(SQLQuery);
}

const createNewOpenTrips = async (body, uuid, publicUrl, totalDays) => {

    const SQLQuery1 = `INSERT INTO open_trip_schedules (open_trip_schedule_uuid, start_date, end_date, start_time, 	end_time, total_day)
                      VALUES (?, ?, ?, ?, ?, ?)`
    const SQLQuery2 = `INSERT INTO open_trips (open_trip_uuid, mountain_uuid, partner_uid, open_trip_schedule_uuid, name, image_url, description, price, min_people, max_people, policy, include, exclude, gmaps)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    const values1 = [
            `schedule-${uuid}`, 
            body.start_date,
            body.end_date,
            body.start_time,
            body.end_time,
            totalDays
    ]

    const values2 = [
            uuid, 
            body.mountain_uuid, 
            body.partner_uid, 
            `schedule-${uuid}`,
            body.name, 
            publicUrl,
            body.description,
            body.price,
            body.min_people,
            body.max_people,
            body.policy,
            body.include,
            body.exclude,
            body.gmaps
    ]

    await dbPool.execute(SQLQuery1, values1);
    await dbPool.execute(SQLQuery2, values2);

    return console.log("Open trip created successfully")
}

module.exports = {
    createNewOpenTrips,
    getAllOpenTrips,
    getAllMountainByOpenTrip,
    getAllOpenTripsById,
    getMitraByOpenTrip,
    getScheduleByOpenTrip,
    getRundownByOpenTrip,
    getFaqByOpenTrip,
    getPartnerProfile,
    getPartnerOpenTrip,
    getPartnerOpenTrip2,
    getAllOpenTrips2
}