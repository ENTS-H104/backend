const { v4: uuidv4 } = require('uuid');
const FaqModels = require ('../models/FaqsModel');

const createNewFaq = async (req, res) => {
    try {
        const { body} = req;
 
        const uuid = uuidv4()
        await FaqModels.createNewFaq(body, uuid);

        res.status(201).json({
            status: 201,
            message: 'FAQ created successfully.',
            data: {
                open_trip_faq_uuid: uuid,
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
    createNewFaq,
}