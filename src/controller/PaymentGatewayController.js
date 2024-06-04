const { v4: uuidv4 } = require('uuid');
const paymentGatewayModel = require ('../models/PaymentGatewayModel')

const getAllPayment = async (req, res) => {
    try {
        const [ data ] = await paymentGatewayModel.getAllPaymentGateway();
        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const createPaymentGateway = async (req, res) => {
    try {
        const { payment_gateway_name} = req.body;

        const payment_gateway_uuid = uuidv4();

        await paymentGatewayModel.createPaymentGateway(payment_gateway_uuid, payment_gateway_name);
        res.status(200).json({
            status: 200,
            message: "Data successfully created",
            payment_gateway_uuid: payment_gateway_uuid,
            payment_gateway_name:payment_gateway_name
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        });
    }
};

module.exports = {
    getAllPayment,
    createPaymentGateway
}