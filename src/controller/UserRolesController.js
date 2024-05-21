const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');

const UserRolesModel = require ('../models/UserRolesModel');

const getAllUserRoles = async (req, res) => {
    try {
        const [ data ] = await UserRolesModel.getAllUserRoles();
        
        // Convert UTC timestamps to UTC+7
        const dataWithLocalTime = data.map(data => ({
            ...data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
            updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
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
}

const getUserRolesById = async (req, res) => {
    try {
        const { user_role_uuid } = req.params;
        const [ data ] = await UserRolesModel.getUserRolesById(user_role_uuid);
        if (data.length === 1) {
            // Convert UTC timestamps to UTC+7
            const dataWithLocalTime = data.map(data => ({
                ...data,
                created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
                updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
            }));
            
            res.status(200).json({
                status: 200,
                message: "Data successfully fetched",
                data: dataWithLocalTime
            });
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${user_role_uuid} not found`,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const createNewUserRoles = async (req, res) => {
    try {
        const { body } = req;

        // Check if name has value
        const name = body.name;
        if (!name) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `name` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['name', 'description'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `name` and `description` only!",
                invalidFields: invalidFields
            });
        }

        const uuid = uuidv4();
        await UserRolesModel.createNewUserRoles(body, uuid);
        res.status(201).json({
            status: 201,
            message: `Successfully created a role`,
            data: {
                user_role_uuid: uuid,
                ...body
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const updateUserRoles = async (req, res) => {
    try {
        const { user_role_uuid } = req.params; 
        const { body } = req
        
        // Check if the body contains only the required fields
        const allowedFields = ['name', 'description'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `name` or `description` only!",
                invalidFields: invalidFields
            });
        }
        
        const [ data ] = await UserRolesModel.getUserRolesById(user_role_uuid);
        
        if (data.length === 1)
        {
            const updated_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
            await UserRolesModel.updateUserRoles(body, updated_at, user_role_uuid);
            res.status(200).json({
                status: 200,
                message: `Successfully update user with uuid: ${user_role_uuid}`,
                data: body
            })
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${user_role_uuid} not found`,
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const deleteUserRoles = async (req, res) => {
    try {
        const { user_role_uuid } = req.params; 
        const [ data ] = await UserRolesModel.getUserRolesById(user_role_uuid);
       
        if (data.length === 1)
        {
            await UserRolesModel.deleteUserRoles(user_role_uuid);
            res.status(200).json({
                status: 200,
                message: `Successfully deleted a role with uuid: ${user_role_uuid}`,
            })
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${user_role_uuid} not found`,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

module.exports = {
    getAllUserRoles,
    getUserRolesById,
    createNewUserRoles,
    updateUserRoles,
    deleteUserRoles
}