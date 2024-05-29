const dbPool = require('../config/database')

const createNewPartnerRoles = (body, uuid) => {
    const hasDescription = 'description' in body && body.description !== null;

    const SQLQuery = hasDescription
        ? `INSERT INTO partner_roles (partner_role_uuid, partner_role_name, description)
           VALUES (?, ?, ?)`
        : `INSERT INTO partner_roles (partner_role_uuid, partner_role_name, description)
           VALUES (?, ?, ?)`;
    
    const values = hasDescription
        ? [uuid, body.partner_role_name, body.description]
        : [uuid, body.partner_role_name, "Belum ada deskripsi"];

    return dbPool.execute(SQLQuery, values);
}

module.exports = {
    createNewPartnerRoles,
}