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
    const SQLQuery1 = `INSERT INTO verified_status (verified_status_uuid) VALUES (?)`
    const SQLQuery2 = `INSERT INTO partners (partner_uid, partner_role_uuid, verified_status_uuid, email, username, image_url, phone_number, domicile_address) VALUES (?, ${defaultRole}, ?, ?, ?, ?, ?, ?)`
    
    const values1 = [uuid]
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

const getDefaultPartnerRole = () => {
    const SQLQuery = `SELECT partner_role_uuid FROM partner_roles WHERE partner_role_name LIKE '%mitra%';`
    return dbPool.execute(SQLQuery);
}

module.exports = {
    getAllPartners,
    registerPartners,
    getCurrentPartners,
    getDefaultPartnerRole,
}