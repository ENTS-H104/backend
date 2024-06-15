const dbPool = require('../config/database')

const getAllUsers = () => {
    const SQLQuery = `SELECT 
                        users.user_uid, 
                        users.verified_status_uuid, 
                        user_roles.name as role,
                        users.email,
                        users.username,
                        users.image_url,
                        users.phone_number,
                        users.created_at,
                        users.updated_at
                       FROM users
                       INNER JOIN user_roles ON users.user_role_uuid = user_roles.user_role_uuid`;
    return dbPool.execute(SQLQuery);
}

const registerUsers = async (uid, email, phone_number, username, uuid, defaultRole) => {    
    const SQLQuery1 = `INSERT INTO verified_status (verified_status_uuid) VALUES (?)`
    const SQLQuery2 = `INSERT INTO users (user_uid, user_role_uuid, verified_status_uuid, email, username, image_url, phone_number) VALUES (?, ${defaultRole}, ?, ?, ?, ?, ?)`
    
    const values1 = [uuid]
    const values2 = [
        uid,
        uuid,
        email,
        username,
        "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2",
        phone_number
    ]

    await dbPool.execute(SQLQuery1, values1);
    await dbPool.execute(SQLQuery2, values2);

    return console.log("User created")
    
}

const getCurrentUser = (uid) => {
    const SQLQuery = `SELECT 
                        users.user_uid, 
                        users.verified_status_uuid, 
                        user_roles.name as role,
                        users.email,
                        users.username,
                        users.image_url,
                        users.phone_number,
                        users.created_at,
                        users.updated_at
                      FROM users
                      INNER JOIN user_roles ON users.user_role_uuid = user_roles.user_role_uuid WHERE user_uid="${uid}"`;
    return dbPool.execute(SQLQuery);
}

const getDefaultUserRole = () => {
    const SQLQuery = `SELECT user_role_uuid FROM user_roles WHERE name LIKE '%user%';`
    return dbPool.execute(SQLQuery);
}

const getUserById = (user_uid) => {
    const SQLQuery = `SELECT * FROM users WHERE user_uid="${user_uid}"`;
    return dbPool.execute(SQLQuery);
}

const updateProfileUser = (body, updated_at, user_uid) => {
    const setClauses = [];

    for (const key in body) {
        setClauses.push(`${key}="${body[key]}"`);
    }

    const SQLQuery = `UPDATE users 
                      SET ${setClauses.join(', ')}, updated_at="${updated_at}"
                      WHERE user_uid="${user_uid}"`;
    return dbPool.execute(SQLQuery);
}

const updatePhotoProfileUser = (publicUrl, updated_at, user_uid) => {
    const SQLQuery = `UPDATE users 
                      SET image_url="${publicUrl}", updated_at="${updated_at}"
                      WHERE user_uid="${user_uid}"`;
    return dbPool.execute(SQLQuery);
}

const getIfMitra = (uid) => {
    const SQLQuery = `SELECT 
                        partner_roles.partner_role_name as role
                      FROM partners
                      INNER JOIN partner_roles ON partners.partner_role_uuid = partner_roles.partner_role_uuid WHERE partner_uid="${uid}"`;
    return dbPool.execute(SQLQuery);
}



module.exports = {
    getAllUsers,
    registerUsers,
    getCurrentUser,
    getDefaultUserRole,
    getUserById,
    updateProfileUser,
    updatePhotoProfileUser,
    getIfMitra
}