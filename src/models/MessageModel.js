const dbPool = require('../config/database')

const SendMessage = async (body, uuid) => {

    const SQLQuery = `INSERT INTO messages (message_uuid, user_uid, partner_uid, message, email)
                      VALUES (?, ?, ?, ?, ?)`
    
    const values = [
            uuid,
            body.user_uid,
            body.partner_uid,
            body.message,
            body.email,
    ]

    return dbPool.execute(SQLQuery, values);
}

const getMessageUserSide = async (body) => {

    const SQLQuery = `SELECT * FROM messages 
                        WHERE user_uid LIKE '%${body.user_uid}%' 
                        AND partner_uid LIKE '%${body.partner_uid}%' 
                        ORDER BY created_at ASC;`

    return dbPool.execute(SQLQuery);
}

const getAllMessageUserSide = async (user_uid) => {

    const SQLQuery = `WITH ranked_messages AS (
                            SELECT *,
                                ROW_NUMBER() OVER (PARTITION BY partner_uid ORDER BY created_at DESC) AS rn
                            FROM messages
                            WHERE user_uid LIKE '%${user_uid}%'
                        )
                        SELECT *
                        FROM ranked_messages
                        WHERE rn = 1
                        ORDER BY created_at DESC;`

    return dbPool.execute(SQLQuery);
}

module.exports = {
    SendMessage,
    getMessageUserSide,
    getAllMessageUserSide
}