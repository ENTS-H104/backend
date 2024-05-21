const dbPool = require('../config/database')

const getAllUserRoles = () => {
    const SQLQuery = `SELECT * FROM user_roles`;
    return dbPool.execute(SQLQuery);
}

const getUserRolesById = (user_role_uuid) => {
    const SQLQuery = `SELECT * FROM user_roles WHERE user_role_uuid="${user_role_uuid}"`;
    return dbPool.execute(SQLQuery);
}

const createNewUserRoles = (body, uuid) => {
    const hasDescription = 'description' in body && body.description !== null;

    const SQLQuery = hasDescription
        ? `INSERT INTO user_roles (user_role_uuid, name, description)
           VALUES (?, ?, ?)`
        : `INSERT INTO user_roles (user_role_uuid, name, description)
           VALUES (?, ?, ?)`;
    
    const values = hasDescription
        ? [uuid, body.name, body.description]
        : [uuid, body.name, "Belum ada deskripsi"];

    return dbPool.execute(SQLQuery, values);
}

const updateUserRoles = (body, updated_at, user_role_uuid) => {
    const setClauses = [];

    for (const key in body) {
        setClauses.push(`${key}="${body[key]}"`);
    }

    const SQLQuery = `UPDATE user_roles 
                      SET ${setClauses.join(', ')}, updated_at="${updated_at}"
                      WHERE user_role_uuid="${user_role_uuid}"`;
    return dbPool.execute(SQLQuery);
}

const deleteUserRoles = (user_role_uuid) => {
    const SQLQuery = `DELETE FROM user_roles
                      WHERE user_role_uuid="${user_role_uuid}"`;
    return dbPool.execute(SQLQuery);
}


module.exports = {
    getAllUserRoles,
    getUserRolesById,
    createNewUserRoles,
    updateUserRoles,
    deleteUserRoles
}