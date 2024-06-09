const dbPool = require('../config/database')

const createParticipants = (participants_uuid, name, nik, handphone_number, transaction_logs_uuid) => {
    const sql = 'INSERT INTO participants (participant_uuid, name, nik, handphone_number, transaction_logs_uuid) VALUES (?, ?, ?, ?, ?)';
    const values = [participants_uuid, name, nik, handphone_number, transaction_logs_uuid];
    return dbPool.execute(sql, values);
};
module.exports = {
    createParticipants
}