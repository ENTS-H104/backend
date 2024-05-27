const moment = require('moment-timezone');
const UsersModel = require ('../models/UsersModel')
const { auth } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    sendPasswordResetEmail,
    } = require('firebase/auth');

const jwt = require('jsonwebtoken');
const blacklist = new Set();

const getAllUsers = async (req, res) => {
    try {
        const [ data ] = await UsersModel.getAllUsers();
        
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

const registerUsers = async (req, res) => {
    try {
        const { body } = req;

        const email = body.email;
        const username = body.username;
        const phone_number = body.phone_number;
        const password = body.password;

        if (!email || !username || !phone_number || !password) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `email, username, phone_number, password` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['email', 'password', 'username', 'phone_number',];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `email, username, phone_number, password` only!",
                invalidFields: invalidFields
            });
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const user = userCredential.user;
        
        await updateProfile(user, {
            displayName: username,
        });

        await sendEmailVerification(auth.currentUser);
        
        const uid = userCredential.user.uid;
        const uuid = uuidv4();

        const [ defaultRole ] = await UsersModel.getDefaultUserRole();
        const defaultRoleToString = JSON.stringify(defaultRole[0].user_role_uuid)
        
        await UsersModel.registerUsers(uid, email, phone_number, username, uuid, defaultRoleToString);
        res.status(201).json({
            status: 201,
            message: `Successfully created an account, Verification email sent. Please check your email`,
            data: {
                user_uid: userCredential.user.uid,
                verified_status_uuid: uuid,
                username: username,
                email: userCredential.user.email,
                phone_number: phone_number,
                role: "user"
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

const loginUsers = async (req, res) => {
    try {
        const { body } = req;

        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `email, password` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['email', 'password',];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `email, password` only!",
                invalidFields: invalidFields
            });
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if email is verified
        if (userCredential.user.emailVerified) {
            const token = jwt.sign({ uid: auth.currentUser.uid }, process.env.JWT_SECRET_KEY, { expiresIn: '60d' });

            res.status(201).json({
                status: 201,
                message: `User with email: ${email} Successfully login`,
                token: token
            });
            await auth.signOut();
        } else {
            // If email is not verified, return 403
            res.status(403).json({
                status: 403,
                code: "not-verified",
                message: 'Email not verified. Please verify your email before logging in.'
            });
            await auth.signOut();
        }
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const logoutUsers = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
    
        if (token) {
            blacklist.add(token);
        }

        res.status(200).json({
            status: 200,
            message: 'Logged out successfully' 
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const currentUsers = async (req, res) => {
    try {
        // Extract token from Authorization header (Bearer token)
        const authHeader = req.headers.authorization;

        const token = authHeader.split(' ')[1];

        if (blacklist.has(token)) {
            return res.status(401).json({
                status: 401,
                message: 'Token revoked'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const [ data ] = await UsersModel.getCurrentUser(decoded.uid);
        // Return user's UID
        res.status(200).json({
            status: 200,
            message: "Successfuly get current user",
            data: data
        });
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: "Unauthorized",
            error: error.message
        });
    }
}


const forgotPasswordUsers = async (req, res) => {
    try {
        const { body } = req;

        const email = body.email;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `email` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['email'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `email` only!",
                invalidFields: invalidFields
            });
        }

        try {
            await sendPasswordResetEmail(auth, email);
            res.status(200).json({
                status: 200,
                message: 'Password reset email sent successfully'
            });
        } catch (error) {
            console.error('Error sending password reset email:', error);
            res.status(400).json({
                status: 400,
                message: 'Failed to send password reset email', error: error.message 
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

module.exports = {
    getAllUsers,
    registerUsers,
    loginUsers,
    logoutUsers,
    forgotPasswordUsers,
    currentUsers,
}
