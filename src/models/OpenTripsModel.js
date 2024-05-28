const dbPool = require('../config/database')

const createNewOpenTrips = (body, uuid) => {
    const hasDescription = 'description' in body && body.description !== null;
    const hasPolicy = 'policy' in body && body.policy !== null;

    const SQLQuery = `INSERT INTO open_trips (open_trip_uuid, mountain_uuid, partner_uid, name, image_url, description, policy)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`
    
    const values = hasDescription && hasPolicy
        ? [
            uuid, 
            body.mountain_uuid, 
            body.partner_uid, 
            body.name, 
            "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2", 
            body.description, 
            body.policy
        ]
        : hasDescription 
        ? [
            uuid, 
            body.mountain_uuid, 
            body.partner_uid, 
            body.name, 
            "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2",
            body.description,
            "Belum ada policy"
        ] : 
        [
            uuid, 
            body.mountain_uuid, 
            body.partner_uid, 
            body.name, 
            "https://firebasestorage.googleapis.com/v0/b/ents-h104-auth.appspot.com/o/users%2Fno-profile%2Fdefault-profile-icon-h104.jpeg?alt=media&token=9f7c25af-e039-46bd-9061-70c26f925cf2", 
            "Belum ada deskripsi",
            body.policy
        ];

    return dbPool.execute(SQLQuery, values);
}

module.exports = {
    createNewOpenTrips,
}