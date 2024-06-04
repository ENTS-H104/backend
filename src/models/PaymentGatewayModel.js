const dbPool = require('../config/database')

const createPaymentGateway = (payment_gateway_uuid, payment_gateway_name) => {
    const sql = 'INSERT INTO payment_gateway (payment_gateway_uuid, payment_gateway_name) VALUES (?, ?)';
    const values = [payment_gateway_uuid, payment_gateway_name];
    return dbPool.execute(sql, values);
};

const getAllPaymentGateway = () => {
    const sql = 'SELECT payment_gateway_uuid, payment_gateway_name FROM payment_gateway';
    return dbPool.execute(sql);
};

const getPaymentGatewayById = (payment_gateway_uuid) => {
    const sql = 'SELECT payment_gateway_uuid, payment_gateway_name FROM payment_gateway WHERE payment_gateway_uuid = ?';
    const values = [payment_gateway_uuid];
    return dbPool.execute(sql, values);
};

module.exports = {
    createPaymentGateway,
    getAllPaymentGateway,
    getPaymentGatewayById
}