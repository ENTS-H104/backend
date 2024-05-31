const dbPool = require('../config/database')

const createNewFaq = async (body, uuid) => {

    const SQLQuery = `INSERT INTO open_trip_faqs (open_trip_faq_uuid, open_trip_uuid, description)
                      VALUES (?, ?, ?)`
    
    const values = [
            uuid,
            body.open_trip_uuid,
            body.description,
    ]

    return dbPool.execute(SQLQuery, values);
}

module.exports = {
    createNewFaq,
}