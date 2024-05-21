const dbPool = require('../config/database')

const getAllUsers = () => {
    const SQLQuery = `SELECT 
                        users.user_id, 
                        users.user_uid, 
                        user_roles.name as role,
                        users.email,
                        users.username,
                        users.image_url,
                        users.phone_number,
                        users.created_at,
                        users.created_at
                       FROM users
                       INNER JOIN user_roles ON users.user_role_id = user_roles.user_role_id`;
    return dbPool.execute(SQLQuery);
}

module.exports = {
    getAllUsers,
}