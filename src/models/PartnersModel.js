const dbPool = require('../config/database')

const getAllPartners = () => {
    const SQLQuery = `SELECT 
                        partners.partner_uid, 
                        partners.verified_status_uuid, 
                        partner_roles.partner_role_name as role,
                        partners.email,
                        partners.username,
                        partners.image_url,
                        partners.phone_number,
                        partners.domicile_address,
                        partners.created_at,
                        partners.updated_at
                       FROM partners
                       INNER JOIN partner_roles ON partners.partner_role_uuid = partner_roles.partner_role_uuid`;
    return dbPool.execute(SQLQuery);
}

const registerPartners = async (uid, email, phone_number, username, uuid, defaultRole, domicile_address) => {    
    const SQLQuery1 = `INSERT INTO verified_status (verified_status_uuid, verified_status) VALUES (?, ?)`
    const SQLQuery2 = `INSERT INTO partners (partner_uid, partner_role_uuid, verified_status_uuid, email, username, image_url, phone_number, domicile_address) VALUES (?, ${defaultRole}, ?, ?, ?, ?, ?, ?)`
    
    const values1 = [uuid, "disabled"]
    const values2 = [
        uid,
        uuid,
        email,
        username,
        "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2",
        phone_number,
        domicile_address
    ]

    await dbPool.execute(SQLQuery1, values1);
    await dbPool.execute(SQLQuery2, values2);

    return console.log("Mitra created")
    
}

const registerPartnersAdmin = async (uid, email, phone_number, username, uuid, defaultRole, domicile_address) => {    
    const SQLQuery1 = `INSERT INTO verified_status (verified_status_uuid, verified_status) VALUES (?, ?)`
    const SQLQuery2 = `INSERT INTO partners (partner_uid, partner_role_uuid, verified_status_uuid, email, username, image_url, phone_number, domicile_address) VALUES (?, ${defaultRole}, ?, ?, ?, ?, ?, ?)`
    
    const values1 = [uuid, "disabled"]
    const values2 = [
        uid,
        uuid,
        email,
        username,
        "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2",
        phone_number,
        domicile_address
    ]

    await dbPool.execute(SQLQuery1, values1);
    await dbPool.execute(SQLQuery2, values2);

    return console.log("Mitra created")
    
}

const getCurrentPartners = (uid) => {
    const SQLQuery = `SELECT 
                        partners.partner_uid, 
                        partners.verified_status_uuid, 
                        partner_roles.partner_role_name as role,
                        partners.email,
                        partners.username,
                        partners.image_url,
                        partners.phone_number,
                        partners.domicile_address,
                        partners.created_at,
                        partners.updated_at
                      FROM partners
                      INNER JOIN partner_roles ON partners.partner_role_uuid = partner_roles.partner_role_uuid WHERE partner_uid="${uid}"`;
    return dbPool.execute(SQLQuery);
}

const getVerificationData = (uid) => {
    const SQLQuery = `SELECT 
                        *
                      FROM verified_status
                      WHERE verified_status_uuid="${uid}"`;
    return dbPool.execute(SQLQuery);
}

const getDefaultPartnerRole = () => {
    const SQLQuery = `SELECT partner_role_uuid FROM partner_roles WHERE partner_role_name LIKE '%mitra%';`
    return dbPool.execute(SQLQuery);
}

const getDefaultPartnerRoleAdmin = () => {
    const SQLQuery = `SELECT partner_role_uuid FROM partner_roles WHERE partner_role_name LIKE '%admin%';`
    return dbPool.execute(SQLQuery);
}

const getPartnerById = (partner_uid) => {
    const SQLQuery = `SELECT * FROM partners WHERE partner_uid="${partner_uid}"`;
    return dbPool.execute(SQLQuery);
}

const updateProfilePartner = (body, updated_at, partner_uid) => {
    const setClauses = [];

    for (const key in body) {
        setClauses.push(`${key}="${body[key]}"`);
    }

    const SQLQuery = `UPDATE partners 
                      SET ${setClauses.join(', ')}, updated_at="${updated_at}"
                      WHERE partner_uid="${partner_uid}"`;
    return dbPool.execute(SQLQuery);
}

const updatePhotoProfilePartner = (publicUrl, updated_at, partner_uid) => {
    const SQLQuery = `UPDATE partners 
                      SET image_url="${publicUrl}", updated_at="${updated_at}"
                      WHERE partner_uid="${partner_uid}"`;
    return dbPool.execute(SQLQuery);
}

const getIfUser = (uid) => {
    const SQLQuery = `SELECT 
                        user_roles.name as role
                      FROM users
                      INNER JOIN user_roles ON users.user_role_uuid = user_roles.user_role_uuid WHERE user_uid="${uid}"`;
    return dbPool.execute(SQLQuery);
}

module.exports = {
    getAllPartners,
    registerPartners,
    getCurrentPartners,
    getDefaultPartnerRole,
    getPartnerById,
    updateProfilePartner,
    updatePhotoProfilePartner,
    getIfUser,
    getVerificationData,
    registerPartnersAdmin,
    getDefaultPartnerRoleAdmin
}