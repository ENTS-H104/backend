const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const MessagesModel = require ('../models/MessageModel');

const getMessageUserSide = async (req, res) => {
    try {
        const { body } = req

        const [ data ] = await MessagesModel.getMessageUserSide(body);
        
        // Convert UTC timestamps to UTC+7
        const dataWithLocalTime = data.map(data => ({
            ...data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
        }));
        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: dataWithLocalTime
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
};

const getAllMessageUserSide = async (req, res) => {
    try {
        const { user_uid } = req.params

        const [ data ] = await MessagesModel.getAllMessageUserSide(user_uid);
        
        // Convert UTC timestamps to UTC+7
        const dataWithLocalTime = data.map(data => ({
            ...data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
        }));
        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: dataWithLocalTime
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
};

const UserSendMessage = async (req, res) => {
    try {
        const { body } = req;
 
        const uuid = uuidv4()
        await MessagesModel.SendMessage(body, uuid);

        res.status(201).json({
            status: 201,
            message: 'Send message successfully.',
            data: {
                message_uuid: uuid,
                ...body,
            }
        });
       
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server Error',
            serverMessage: error.message,
        });
    }
};

const PartnerSendMessage = async (req, res) => {
    try {
        const { body } = req;
 
        const uuid = uuidv4()
        await MessagesModel.SendMessage(body, uuid);

        res.status(201).json({
            status: 201,
            message: 'Send message successfully.',
            data: {
                message_uuid: uuid,
                ...body,
            }
        });
       
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server Error',
            serverMessage: error.message,
        });
    }
};
module.exports = {
    UserSendMessage,
    PartnerSendMessage,
    getMessageUserSide,
    getAllMessageUserSide
}