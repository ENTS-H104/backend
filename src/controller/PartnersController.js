const moment = require('moment-timezone');
const PartnersModel = require ('../models/PartnersModel')
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

const { Storage } = require('@google-cloud/storage');
    
const storage = new Storage()
const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);


const getAllPartners = async (req, res) => {
    try {
        const { api_key } = req.query;

        
        if ( api_key === process.env.API_KEY) {
            const [ data ] = await PartnersModel.getAllPartners();
        
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

const getAllMitraNeedVerification = async (req, res) => {
    try {

        const { status } = req.query;

        const [allPartnersData] = await PartnersModel.getAllMitraNeedVerification(status);

        const dataWithRelationship = await Promise.all(allPartnersData.map(async (partner) => {
            const [ verification_data ] = await PartnersModel.getVerificationData(partner.verified_status_uuid);
            
            return {
                partner_uid: partner.partner_uid,
                verified_status_uuid: partner.verified_status_uuid,
                role: partner.role,
                email: partner.email,
                username: partner.username,
                image_url: partner.image_url,
                phone_number: partner.phone_number,
                domicile_address: partner.domicile_address,
                created_at: moment.utc(partner.created_at).tz('Asia/Bangkok').format(),
                updated_at: moment.utc(partner.updated_at).tz('Asia/Bangkok').format(),
                verification_data
            };
        }));

        
        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: dataWithRelationship
        });
    
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const changeMitraStatus = async (req, res) => {
    try {
        const { body } = req
        
        // Check if the body contains only the required fields
        const allowedFields = ['verified_status_uuid', 'verified_status', 'message'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input 'verified_status', 'message' only!",
                invalidFields: invalidFields
            });
        }

        const [ data ] = await PartnersModel.getVerificationData(body.verified_status_uuid);
        
        if (data.length === 1)
        {
            const updated_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
            await PartnersModel.updateStatusMitra(body, updated_at, body.verified_status_uuid);
            res.status(200).json({
                status: 200,
                message: `Successfully update mitra with uid: ${body.verified_status_uuid}`,
                data: body
            })
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${partner_uid} not found`,
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const registerPartners = async (req, res) => {
    try {
        const { body } = req;

        const email = body.email;
        const username = body.username;
        const phone_number = body.phone_number;
        const password = body.password;
        const domicile_address = body.domicile_address;

        if (!email || !username || !phone_number || !password) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. `email, username, phone_number, password, domicile_address` is required",
            })
        }

        // Check if the body contains only the required fields
        const allowedFields = ['email', 'password', 'username', 'phone_number', 'domicile_address'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `email, username, phone_number, password, domicile_address` only!",
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

        const [ defaultRole ] = await PartnersModel.getDefaultPartnerRole();
        const defaultRoleToString = JSON.stringify(defaultRole[0].partner_role_uuid)
        
        await PartnersModel.registerPartners(uid, email, phone_number, username, uuid, defaultRoleToString, domicile_address);
        res.status(201).json({
            status: 201,
            message: `Successfully created an account, Verification email sent. Please check your email`,
            data: {
                partner_uid: userCredential.user.uid,
                verified_status_uuid: uuid,
                username: username,
                email: userCredential.user.email,
                phone_number: phone_number,
                domicile_address: domicile_address,
                role: "mitra"
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

const registerPartnersAdmin = async (req, res) => {
    try {

        const { api_key } = req.query

        if (api_key === process.env.API_KEY) {
            const { body } = req;

            const email = body.email;
            const username = body.username;
            const phone_number = body.phone_number;
            const password = body.password;
            const domicile_address = body.domicile_address;
    
            if (!email || !username || !phone_number || !password) {
                return res.status(400).json({
                    status: 400,
                    message: "Bad Request. `email, username, phone_number, password, domicile_address` is required",
                })
            }
    
            // Check if the body contains only the required fields
            const allowedFields = ['email', 'password', 'username', 'phone_number', 'domicile_address'];
            const receivedFields = Object.keys(body);
            const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    
            if (invalidFields.length > 0) {
                return res.status(400).json({
                    status: 400,
                    message: "Bad Request. Invalid fields found, please input `email, username, phone_number, password, domicile_address` only!",
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
    
            const [ defaultRole ] = await PartnersModel.getDefaultPartnerRoleAdmin();
            const defaultRoleToString = JSON.stringify(defaultRole[0].partner_role_uuid)

            await PartnersModel.registerPartnersAdmin(uid, email, phone_number, username, uuid, defaultRoleToString, domicile_address);
            res.status(201).json({
                status: 201,
                message: `Successfully created an account, Verification email sent. Please check your email`,
                data: {
                    partner_uid: userCredential.user.uid,
                    verified_status_uuid: uuid,
                    username: username,
                    email: userCredential.user.email,
                    phone_number: phone_number,
                    domicile_address: domicile_address,
                    role: "admin"
                }
            })
        }
       
    } catch (error) {
        res.status(401).json({
            status: 401,
            message: "Unauthorized",
        })
    }
}

const loginPartners = async (req, res) => {
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
            const [ ifUser ] = await PartnersModel.getIfUser(userCredential.user.uid);
            const checkRole = ifUser[0].role;
    
            // Check if its from partners
            if( checkRole === "user" ) {
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
                    message: `Mitra with email: ${email} Successfully login`,
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

const logoutPartners = async (req, res) => {
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

const currentPartners = async (req, res) => {
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

        
        const [ data ] = await PartnersModel.getCurrentPartners(decoded.uid);
        const verifiedUuid = data[0].verified_status_uuid;
        
        const [ verified_data ] = await PartnersModel.getVerificationData(verifiedUuid);

        if (data.length === 0 ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            });
        }

        const dataWithLocalTime = data.map(data => ({
            ...data,
            verification_data: verified_data,
            created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
            updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
        }));
        // Return user's UID
        res.status(200).json({
            status: 200,
            message: "Successfuly get current mitra",
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


const forgotPasswordPartners = async (req, res) => {
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

const updateProfilePartner = async (req, res) => {
    try {
        const { body } = req

        // Check Token
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const partner_uid = decoded.uid;

        if (blacklist.has(token)) {
            return res.status(401).json({
                status: 401,
                message: 'Token revoked'
            });
        }

        const [ data ] = await PartnersModel.getPartnerById(partner_uid);

        if (data.length === 0 ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            });
        }
        
        // Check if the body contains only the required fields
        const allowedFields = ['username', 'phone_number', 'domicile_address'];
        const receivedFields = Object.keys(body);
        const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request. Invalid fields found, please input `username`, `phone_number`, `domicile_address` only!",
                invalidFields: invalidFields
            });
        }
        
        if (data.length === 1)
        {
            const updated_at = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
            await PartnersModel.updateProfilePartner(body, updated_at, partner_uid);
            res.status(200).json({
                status: 200,
                message: `Successfully update mitra with uid: ${partner_uid}`,
                data: body
            })
        } else {
            res.status(404).json({
                status: 404,
                message: `Role with uuid: ${partner_uid} not found`,
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error,
        })
    }
}

const updatePhotoProfilePartner = async (req, res) => {
    try {
        const { file } = req;

        // Check Token
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const partner_uid = decoded.uid;

        if (blacklist.has(token)) {
            return res.status(401).json({
                status: 401,
                message: 'Token revoked'
            });
        }

        const [ data ] = await PartnersModel.getPartnerById(partner_uid);

        if (data.length === 0 ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token'
            });
        }

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
                await PartnersModel.updatePhotoProfilePartner(publicUrl, updated_at, partner_uid);
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

const MitraVerification = async (req, res) => {
    try {
        const { body, files } = req;

         // Check Token
         const authHeader = req.headers.authorization;
         const token = authHeader.split(' ')[1];
         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
         const partner_uid = decoded.uid;
 
         if (blacklist.has(token)) {
             return res.status(401).json({
                 status: 401,
                 message: 'Token revoked'
             });
         }
 
         const [ data ] = await PartnersModel.getPartnerById(partner_uid);

        const verifiedUuid = data[0].verified_status_uuid;

 
         if (data.length === 0 ) {
             return res.status(401).json({
                 status: 401,
                 message: 'Invalid token'
             });
         }
        
        if (!files || !files.image_ktp || !files.image_selfie_and_ktp) {
            return res.status(400).json({ message: 'Both image_ktp and image_selfie_and_ktp files must be uploaded.' });
        }

        const imageKtpFile = files.image_ktp[0];
        const imageSelfieAndKtpFile = files.image_selfie_and_ktp[0];

        const jakartaTime = moment().tz('Asia/Jakarta').format('YYYYMMDD_HHmmss');

        const blobName1 = `partners/verification/${Date.now()}_${jakartaTime}_${imageKtpFile.originalname}`;
        const blob1 = bucket.file(blobName1);
        const blobStream1 = blob1.createWriteStream({ resumable: false });

        const blobName2 = `partners/verification/${Date.now()}_${jakartaTime}_${imageSelfieAndKtpFile.originalname}`;
        const blob2 = bucket.file(blobName2);
        const blobStream2 = blob2.createWriteStream({ resumable: false });

        // Helper function to handle blob stream events
        const uploadFile = (blobStream, file, res, fileName) => new Promise((resolve, reject) => {
            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve(publicUrl);
            });

            blobStream.on('error', (err) => {
                reject(err);
            });

            blobStream.end(file.buffer);
        });

        try {
            const [publicUrl1, publicUrl2] = await Promise.all([
                uploadFile(blobStream1, imageKtpFile, res, blobName1),
                uploadFile(blobStream2, imageSelfieAndKtpFile, res, blobName2)
            ]);

            await PartnersModel.MitraVerification(body, publicUrl1, publicUrl2, verifiedUuid);

            res.status(200).json({
                status: 200,
                message: 'Verification successful',
                data: {
                    image_ktp: publicUrl1,
                    image_selfie_and_ktp: publicUrl2,
                    nik: body.nik,
                    name: body.name,
                    message: "Verifikasi dalam tahap pemeriksaan admin, silahkan tunggu hasil"
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Server Error',
                serverMessage: error.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            serverMessage: error.message,
        });
    }
};

module.exports = {
    getAllPartners,
    registerPartners,
    loginPartners,
    logoutPartners,
    forgotPasswordPartners,
    currentPartners,
    updateProfilePartner,
    updatePhotoProfilePartner,
    registerPartnersAdmin,
    MitraVerification,
    getAllMitraNeedVerification,
    changeMitraStatus
}
