const dbPool = require('../config/database')
const moment = require('moment-timezone');

const createTransaction = (transaction_logs_uuid, user_uid, open_trip_uuid, status_accepted, total_participant, amount_paid, payment_gateway_uuid) => {
    const sql = 'INSERT INTO transaction_logs (transaction_logs_uuid, user_uid, open_trip_uuid, status_accepted, total_participant, amount_paid, payment_gateway_uuid) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [transaction_logs_uuid, user_uid, open_trip_uuid, status_accepted, total_participant, amount_paid, payment_gateway_uuid];
    return dbPool.execute(sql, values);
};

const getPriceAndSeatAvailableOpenTrips = (uuid) => {
    const sql = `SELECT ot.price, (ot.max_people - COALESCE(SUM(tl.total_participant), 0)) AS total_seat_available
    FROM open_trips ot
    LEFT JOIN transaction_logs tl
      ON ot.open_trip_uuid = tl.open_trip_uuid
      OR tl.status_accepted = "ACCEPTED"
      OR tl.status_payment = "PENDING"
    WHERE ot.open_trip_uuid = ?
    GROUP BY ot.price, ot.max_people;`;
    return dbPool.execute(sql, [uuid]);
};
const updateTransactionStatus = (transaction_logs_uuid, status) => {
    const time = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const sql = 'UPDATE transaction_logs SET status_payment = ?, updated_at = ? WHERE transaction_logs_uuid = ?';
    const values = [status, time, transaction_logs_uuid];
    return dbPool.execute(sql, values);
};

const updateAcceptedStatus = (transaction_logs_uuid, status) => {
    const time = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const sql = 'UPDATE transaction_logs SET status_accepted = ?, updated_at = ? WHERE transaction_logs_uuid = ?';
    const values = [status, time, transaction_logs_uuid];
    return dbPool.execute(sql, values);
};

const setTokenTransaction = (transaction_logs_uuid, token)=>{
    const time = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    const sql = 'UPDATE transaction_logs SET token = ?, updated_at = ? WHERE transaction_logs_uuid = ?';
    const values = [token, time, transaction_logs_uuid];
    return dbPool.execute(sql, values);
};

const deleteTransaction = (transaction_logs_uuid) => {
    const sql = 'DELETE FROM transaction_logs WHERE transaction_logs_uuid = ?';
    const values = [transaction_logs_uuid];
    return dbPool.execute(sql, values);
};

const getHistoriesTransaction = (uuid, status) => {
    const sql = `SELECT * FROM transaction_logs
                WHERE user_uid=?
                AND status_payment="SUCCESS" AND status_accepted=?`;
    return dbPool.execute(sql, [uuid, status]);
};

const getUserBalance = (uuid) => {
    const sql = `SELECT user_uid, balance FROM users WHERE user_uid= ?`;
    return dbPool.execute(sql, [uuid]);
};

const getTransactionByUUid = (uuid) => {
    const sql = `SELECT user_uid, amount_paid FROM transaction_logs WHERE transaction_logs_uuid= ?`;
    return dbPool.execute(sql, [uuid]);
};

const payBalanceUser = (uuid, amount) => {
    const sql = `UPDATE users SET balance = balance - ? WHERE user_uid = ?`;
    return dbPool.execute(sql, [amount, uuid]);
};

const getPendingTransactionsOver24Hours = () => {
    const sql = 'SELECT transaction_logs_uuid, user_uid, amount_paid FROM transaction_logs WHERE status_accepted = "PENDING" AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24';
    return dbPool.execute(sql);
};

const setRefundBalanceOfUser = (uuid, amount) => {
    const sql = `UPDATE users SET balance = balance + ? WHERE user_uid = ?`;
    return dbPool.execute(sql, [amount, uuid]);
};

const getUserIdByTransactionId = (uuid) => {
    const sql = `SELECT user_uid FROM transaction_logs WHERE transaction_logs_uuid = ?`;
    return dbPool.execute(sql, [uuid]);
};

const getDetailTransaction = (uuid) => {
    const sql = `SELECT 
                    tl.token,
                    ot.name,
                    partners.phone_number,
                    ots.start_date,
                    ots.start_time,
                    ot.meeting_point,
                    tl.status_accepted,
                    tl.status_payment,
                    GROUP_CONCAT(participants.name) AS name_participant
                FROM transaction_logs tl
                JOIN open_trips ot ON tl.open_trip_uuid=ot.open_trip_uuid
                JOIN open_trip_schedules ots ON ots.open_trip_schedule_uuid=ot.open_trip_schedule_uuid
                JOIN participants ON tl.transaction_logs_uuid=participants.transaction_logs_uuid
                JOIN partners ON partners.partner_uid=ot.partner_uid
                WHERE tl.transaction_logs_uuid= ?
                GROUP BY 
                    tl.token,
                    ot.name,
                    partners.phone_number,
                    ots.start_date,
                    ots.start_time,
                    ot.meeting_point,
                    tl.status_accepted,
                    tl.status_payment;`;
    return dbPool.execute(sql, [uuid]);
};

const getTransactionByPartnerUUID = (uuid) => {
    const sql = `SELECT 
                    tl.transaction_logs_uuid,
                    tl.user_uid,
                    tl.open_trip_uuid,
                    tl.status_payment,
                    tl.status_accepted,
                    tl.total_participant,
                    tl.amount_paid,
                    pg.payment_gateway_name,
                    tl.token
                    FROM transaction_logs tl
                    JOIN open_trips ot ON ot.open_trip_uuid = tl.open_trip_uuid
                    JOIN payment_gateway pg ON pg.payment_gateway_uuid=tl.payment_gateway_uuid
                    WHERE ot.partner_uid = ?`;
    return dbPool.execute(sql, [uuid]);
};

module.exports = {
    createTransaction,
    getPriceAndSeatAvailableOpenTrips,
    updateTransactionStatus,
    deleteTransaction,
    getHistoriesTransaction,
    getUserBalance,
    payBalanceUser,
    setTokenTransaction,
    getPendingTransactionsOver24Hours,
    updateAcceptedStatus,
    setRefundBalanceOfUser,
    getUserIdByTransactionId,
    getTransactionByUUid,
    getDetailTransaction,
    getTransactionByPartnerUUID
}