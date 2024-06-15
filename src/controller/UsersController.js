const moment = require('moment-timezone');
const UsersModel = require ('../models/UsersModel')
const { auth } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');
const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    sendPasswordResetEmail,
    } = require('firebase/auth');
    
    const jwt = require('jsonwebtoken');
    const blacklist = new Set();
    
const storage = new Storage()
const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);

const getAllUsers = async (req, res) => {
    try {
        const { api_key } = req.query

        if ( api_key === process.env.API_KEY) {
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
        } else {
            res.status(403).json({
                status: 403,
                message: "Forbidden",
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

        try {
            const [ ifMitra ] = await UsersModel.getIfMitra(userCredential.user.uid);
            const checkRole = ifMitra[0].role;
    
            // Check if its from partners
            if( checkRole === "mitra" ) {
                res.status(500).json({
                    status: 500,
                    message: "Server Error",
                    serverMessage: {
                        code: "auth/invalid-credential",
                        customData : {},
                        name: "FirebaseError"
                    }
                });
                await auth.signOut();
                return 1;
            }
            
            
        } catch (error) {
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

        if (data.length === 0 ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            });
        }
        
        const dataWithLocalTime = data.map(data => ({
            ...data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
            updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
        }));
        // Return user's UID
        res.status(200).json({
            status: 200,
            message: "Successfuly get current user",
            data: dataWithLocalTime
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

const updateProfileUser = async (req, res) => {
    try {
        const { user_uid } = req.params; 
        const { body } = req
        
        // Check if the body contains only the required fields
        const allowedFields = ['username', 'phone_number'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `username` or `phone_number` only!",
                invalidFields: invalidFields
            });
        }
        
        const [ data ] = await UsersModel.getUserById(user_uid);
        
        if (data.length === 1)
        {
            const updated_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
            await UsersModel.updateProfileUser(body, updated_at, user_uid);
            res.status(200).json({
                status: 200,
                message: `Successfully update user with uid: ${user_uid}`,
                data: body
            })
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${user_uid} not found`,
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const updatePhotoProfileUser = async (req, res) => {
    try {
        const { user_uid } = req.params;
        const { file } = req;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Create a new blob in the bucket and upload the file data
        const jakartaTime = moment().tz('Asia/Jakarta').format('YYYYMMDD_HHmmss');
        const blobName = `users/profile/${Date.now()}_${jakartaTime}_${req.file.originalname}`;
        const blob = bucket.file(blobName);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('finish', async () => {
            // The public URL can be used to access the file via HTTP
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            try {
                const updated_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
                await UsersModel.updatePhotoProfileUser(publicUrl, updated_at, user_uid);
            } catch (error) {
                res.status(500).json({
                    status: 500,
                    message: 'Server Error',
                    serverMessage: error.message,
                });
                return 0
            }


            res.status(200).json({
                status: 200,
                message: 'Photo profile successfully updated',
                data: {
                    image_url: publicUrl
                }
            });
        });

        blobStream.on('error', (err) => {
            res.status(500).json({
                status: 500,
                message: 'Unable to upload file.',
                serverMessage: err.message,
            });
            return 0
        });

        blobStream.end(file.buffer);
    } catch (error) {
        res.status(500).json({
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
    updateProfileUser,
    updatePhotoProfileUser
}
