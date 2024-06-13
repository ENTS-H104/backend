const { v4: uuidv4 } = require('uuid');
const TransactionModel = require ('../models/TransactionModel')
const ParticipantsModel = require ('../models/ParticipantsModel');
const PaymentGatewayModel = require ('../models/PaymentGatewayModel');
const snap = require('../config/midtrans');
const shortid = require('shortid');
const crypto = require('crypto');
const cron = require('node-cron');


const createTransaction = async (req, res) => {
    try {
        const { user_uid, open_trip_uuid, total_participant, participants, payment_gateway_uuid} = req.body;
        const payment = await PaymentGatewayModel.getPaymentGatewayById(payment_gateway_uuid);

        if ((payment[0][0].payment_gateway_name).toLowerCase()==="midtrans"){
            const transaction_logs_uuid = uuidv4();
            try {
                const openTripPrice = await TransactionModel.getPriceAndSeatAvailableOpenTrips(open_trip_uuid);
                if (openTripPrice[0][0].total_seat_available <= 0) {
                    console.log(openTripPrice[0][0].total_seat_available)
                    return res.status(400).json({ message: 'No seats available' });
                }
                const amount_paid = openTripPrice[0][0].price * total_participant;
                
                // Create transaction log
                await TransactionModel.createTransaction(
                    transaction_logs_uuid,
                    user_uid,
                    open_trip_uuid,
                    "PENDING", 
                    total_participant,
                    amount_paid,
                    payment_gateway_uuid

                );
        
                // Create participants
                const participantsData = [];
                for (const participant of participants) {
                    const { name, nik, handphone_number } = participant;
        
                    if (!name || !nik || !handphone_number) {
                        TransactionModel.deleteTransaction(transaction_logs_uuid);
                        return res.status(400).json({ error: 'Invalid participant data' });
                    }
        
                    const participants_uuid = uuidv4();
        
                    await ParticipantsModel.createParticipants(
                        participants_uuid,
                        name,
                        nik,
                        handphone_number,
                        transaction_logs_uuid
                    );
                    participantsData.push({
                        participants_uuid,
                        name,
                        nik,
                        handphone_number,
                        transaction_logs_uuid
                    });
                }
    
                // Create Midtrans transaction parameters
                const transactionParams = {
                    transaction_details: {
                        order_id: transaction_logs_uuid,
                        gross_amount: amount_paid,
                    }
                };
    
                try {
                    // Get Midtrans snap token
                snap.createTransaction(transactionParams)
                .then((transaction) => {
                    // Transaction token
                    const transactionToken = transaction.token;
                    console.log(transactionToken)

                    res.status(201).json({
                        message: 'Transaction created successfully',
                        data: {
                            transaction_logs_uuid,
                            user_uid,
                            open_trip_uuid,
                            status: "PENDING",
                            total_participant,
                            amount_paid,
                            participants: participantsData,
                            payment_gateway : payment[0][0].payment_gateway_name,
                            transaction_token: transactionToken
                        }
                    });
                })
                .catch((error) => {
                    TransactionModel.deleteTransaction(transaction_logs_uuid);
                    res.status(500).json({ error: 'Failed to create Midtrans transaction' });
                });
                } catch (error) {
                    res.status(500).json({ error: 'Failed to create Midtrans transaction' });
                }
                
    
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }            
        }else if((payment[0][0].payment_gateway_name).toLowerCase()==="highkingpay"){
            const balance_user = await TransactionModel.getUserBalance(user_uid);
            const openTripPrice = await TransactionModel.getPriceAndSeatAvailableOpenTrips(open_trip_uuid);
            if (openTripPrice[0][0].total_seat_available <= 0) {
                return res.status(400).json({ message: 'No seats available' });
            }
            const amount_paid = openTripPrice[0][0].price * total_participant;
            if (amount_paid > balance_user[0][0].balance) {
                return res.status(400).json({ message: 'User balance is insufficient' });
            }
            const transaction_logs_uuid = uuidv4();
            // Create transaction log
            await TransactionModel.createTransaction(
                transaction_logs_uuid,
                user_uid,
                open_trip_uuid,
                "PENDING", 
                total_participant,
                amount_paid,
                payment_gateway_uuid
            );
    
            // Create participants
            const participantsData = [];
            for (const participant of participants) {
                const { name, nik, handphone_number } = participant;
    
                if (!name || !nik || !handphone_number) {
                    TransactionModel.deleteTransaction(transaction_logs_uuid);
                    return res.status(400).json({ error: 'Invalid participant data' });
                }
    
                const participants_uuid = uuidv4();
    
                await ParticipantsModel.createParticipants(
                    participants_uuid,
                    name,
                    nik,
                    handphone_number,
                    transaction_logs_uuid
                );
                participantsData.push({
                    participants_uuid,
                    name,
                    nik,
                    handphone_number,
                    transaction_logs_uuid
                });
            }
            await TransactionModel.payBalanceUser(user_uid, amount_paid);
            await TransactionModel.updateTransactionStatus(transaction_logs_uuid,"SUCCESS");

            res.status(201).json({
                message: 'Transaction created successfully',
                data: {
                    transaction_logs_uuid,
                    user_uid,
                    open_trip_uuid,
                    status: "PENDING",
                    total_participant,
                    amount_paid,
                    participants: participantsData,
                    payment_gateway : payment[0][0].payment_gateway_name
                }
            });
        }else{
            return res.status(400).json({ message: 'No Payment Gateway available' });
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        });
    }
};

const verifyNotification = (req) => {
    const notificationBody = req.body;
    const serverKey = process.env.SERVER_KEY;
    const orderId = notificationBody.order_id;
    const statusCode = notificationBody.status_code;
    const grossAmount = notificationBody.gross_amount;
    const inputSignature = notificationBody.signature_key;

    const hash = crypto.createHash('sha512');
    hash.update(orderId + statusCode + grossAmount + serverKey);
    const calculatedSignature = hash.digest('hex');

    return inputSignature === calculatedSignature;
};

const handleMidtransNotification = async (req, res) => {
    if (!verifyNotification(req)) {
        return res.status(400).send('Invalid signature');
    }

    try {
        const notification = await snap.transaction.notification(req.body);
        console.log(notification)
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log(`Transaction notification received: ${transactionStatus}`);

        // Handle transaction status
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                await TransactionModel.updateTransactionStatus(orderId, 'SUCCESS');
            } else if (fraudStatus === 'deny') {
                await TransactionModel.updateTransactionStatus(orderId, 'DENIED');
            }
        } else if (transactionStatus === 'settlement') {
            await TransactionModel.updateTransactionStatus(orderId, 'SUCCESS');
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            await TransactionModel.updateTransactionStatus(orderId, 'FAILED');
        } else if (transactionStatus === 'pending') {
            await TransactionModel.updateTransactionStatus(orderId, 'PENDING');
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Midtrans notification error:', error);
        res.status(500).send('Internal server error');
    }
};

const getHistoriesTransaction = async (req, res) => {
    try {
        let { id, status } = req.query;
        
        const [data] = await TransactionModel.getHistoriesTransaction(id, status);
        
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
        });
    }
};

const updateStatusAccepted = async (req, res) => {
    try {
        const { id, status } = req.body;
        
        // Get transaction details
        const [transaction] = await TransactionModel.getTransactionByUUid(id);
        if (!transaction[0]) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        
        const { user_uid, amount_paid } = transaction[0];
        
        if (status === 'CANCELED') {
            await TransactionModel.updateAcceptedStatus(id, 'CANCELED');
            console.log(user_uid, amount_paid);
            await TransactionModel.setRefundBalanceOfUser(user_uid, amount_paid);
            return res.status(200).json({
                status: 200,
                message: 'Transaction successfully edited',
                transaction_id: id,
                status_accepted: 'CANCELED'
            });
        } else if (status === 'ACCEPTED') {
            await TransactionModel.updateAcceptedStatus(id, 'ACCEPTED');
            const token = shortid.generate();
            token = token.replace(/[^a-zA-Z0-9]/g, '');
            await TransactionModel.setTokenTransaction(id, token);
            return res.status(200).json({
                status: 200,
                message: 'Transaction successfully edited',
                transaction_id: id,
                status_accepted: 'ACCEPTED',
                token: token
            });
        }
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server Error',
            serverMessage: error.message,
        });
    }
};

// Cron job to update status of pending transactions to canceled every minute
cron.schedule('* * * * *', async () => { // Runs every minute
    try {
        const [rows] = await TransactionModel.getPendingTransactionsOver24Hours();
        for (let row of rows) {
            await TransactionModel.updateAcceptedStatus(row.transaction_logs_uuid,"CANCELED");
            await TransactionModel.setRefundBalanceOfUser(row.user_uid,row.amount_paid);
        }
    } catch (error) {
        console.error('Error updating transaction statuses:', error);
    }
});

const getDetailTransaction = async (req, res) => {
    try {
        let { transaction_uuid } = req.params;
        
        const [data] = await TransactionModel.getDetailTransaction(transaction_uuid);
        
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
        });
    }
};

module.exports = {
    createTransaction,
    handleMidtransNotification,
    getHistoriesTransaction,
    updateStatusAccepted,
    getDetailTransaction
};