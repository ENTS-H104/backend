const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const { Storage } = require('@google-cloud/storage');
const firestore = require('../config/firestore');
const jwt = require('jsonwebtoken');
const PartnersModel = require ('../models/PartnersModel')
// const UsersModel = require ('../models/UsersModel')


const OpenTripsModel = require ('../models/OpenTripsModel');

const storage = new Storage()

const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);

const getAllOpenTrips = async (req, res) => {
    try {
        // Destructure page, limit, and offset from query parameters, with default values
        let { page=1, limit=1000, offset} = req.query;

        // Parse page and limit as integers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Calculate offset if not provided
        if (offset === undefined) {
            offset = (page - 1) * limit;
        } else {
            offset = parseInt(offset, 10);
        }

        // Fetch data with limit and offset for pagination
        const [ data ] = await OpenTripsModel.getAllOpenTrips2(limit, offset);

        res.status(200).json({
            status: 200,
            message: "Data successfully fetched",
            data: data,
        });
    } catch (error) {
        console.error('Error fetching open trips:', error);

        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error.message,
        });
    }
};


const getAllOpenTripsById = async (req, res) => {
    try {
        const { open_trip_uuid } = req.params;
        const [ data ] = await OpenTripsModel.getAllOpenTripsById(open_trip_uuid);

        // Check Token
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user_uid = decoded.uid;

        // const [ isUser ] = await UsersModel.getCurrentUser(decoded.uid);

        // if (isUser.length === 0 ) {
        //     return res.status(401).json({
        //         status: 401,
        //         message: 'Invalid token'
        //     });
        // }
  
        if (!open_trip_uuid || !user_uid) {
            return res.status(400).json({
            status: 400,
            message: 'Missing required fields',
            open  
            });
        }
    
        // Create a timestamp in Jakarta time
        const createdAt = moment().tz('Asia/Jakarta').toISOString();
        const opentrip_clicks_uuid = uuidv4();
    
        // Data to store
        const userClickedDetailOpenTrip = {
            opentrip_clicks_uuid,
            open_trip_uuid,
            user_uid,
            createdAt,
        };
    
        // Reference to the user's document
        const userDocRef = firestore.collection('users_log').doc(user_uid);

        // Reference to the subcollection 'mountain_clicks' within the user's document
        const clicksCollectionRef = userDocRef.collection('opentrip_clicks');

        // Add userClickedDetailOpenTrip to the subcollection
        await clicksCollectionRef.add(userClickedDetailOpenTrip);
        
        // Fetch mountain data for each open trip
        const dataWithRelationship = await Promise.all(data.map(async (trip) => {
            const [ mountain_data ] = await OpenTripsModel.getAllMountainByOpenTrip(trip.mountain_uuid);
            const [ mitra_data ] = await OpenTripsModel.getMitraByOpenTrip(trip.partner_uid);
            const [ schedule_data ] = await OpenTripsModel.getScheduleByOpenTrip(trip.open_trip_schedule_uuid);
            const [ rundown_data ] = await OpenTripsModel.getRundownByOpenTrip(trip.open_trip_uuid);
            const [ faq_data ] = await OpenTripsModel.getFaqByOpenTrip(trip.open_trip_uuid);
            return {
                open_trip_uuid: trip.open_trip_uuid,
                open_trip_name: trip.name,
                image_url: trip.image_url,
                description: trip.description,
                price: trip.price,
                min_people: trip.min_people,
                max_people: trip.max_people,
                include: trip.include,
                exclude: trip.exclude,
                gmaps: trip.gmaps,
                policy: trip.policy,
                mountain_data,
                mitra_data,
                schedule_data,
                rundown_data,
                faq_data,
            };
        }));

        

        return res.status(200).json({
            status: 200,
            message: "Open Trips successfully fetched",
            data: dataWithRelationship
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        });
    }
}

const getPartnerProfile = async (req, res) => {
    try {
        const { partner_uid } = req.params;
        const [ data ] = await OpenTripsModel.getPartnerProfile(partner_uid);
        
        // Fetch mountain data for each open trip
        const dataWithRelationship = await Promise.all(data.map(async (trip) => {
            const [ open_trip_data ] = await OpenTripsModel.getPartnerOpenTrip2(partner_uid);
            return {
                ...trip,
                created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
                updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format(),
                open_trip_data
            };
        }));

        res.status(200).json({
            status: 200,
            message: "Detail Mitra successfully fetched",
            data: dataWithRelationship
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
            serverMessage: error,
        });
    }
}

const createNewOpenTrips = async (req, res) => {
    try {
        const { body, file } = req;

        const [ partnerDetail ] = await PartnersModel.getCurrentPartners(body.partner_uid)
        const [ verified_status ] = await PartnersModel.getVerificationData(partnerDetail[0].verified_status_uuid)
        const isAccepted = verified_status[0].verified_status
           
        if ( isAccepted.toLowerCase() === "accepted" ) {
            const startDateObj = new Date(body.start_date);
            const endDateObj = new Date(body.end_date);
        
            // Calculate the difference in milliseconds
            const differenceInMilliseconds = endDateObj - startDateObj;
        
            // Convert milliseconds to days
            const millisecondsPerDay = 1000 * 60 * 60 * 24;
            const totalDays = differenceInMilliseconds / millisecondsPerDay;
    
            if (!file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
    
            // Create a new blob in the bucket and upload the file data
            const jakartaTime = moment().tz('Asia/Jakarta').format('YYYYMMDD_HHmmss');
            const blobName = `open-trips/${Date.now()}_${jakartaTime}_${req.file.originalname}`;
            const blob = bucket.file(blobName);
            const blobStream = blob.createWriteStream({
                resumable: false,
            });
    
            blobStream.on('finish', async () => {
                // The public URL can be used to access the file via HTTP
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
                // You can now use the public URL and body data to create a new OpenTrips 
    
                const uuid = uuidv4();
                try {
                    await OpenTripsModel.createNewOpenTrips(body, uuid, publicUrl, totalDays);
                } catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: 'Server Error',
                        serverMessage: error.message,
                    });
                    return 0
                }
    
    
                res.status(201).json({
                    status: 201,
                    message: 'Open trip created successfully.',
                    data: {
                        open_trip_uuid: uuid,
                        open_trip_schedule_uuid: `schedule-${uuid}`,
                        ...body,
                        image_url: publicUrl,
                        total_day: totalDays
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
        } else {
            return res.status(403).json({
                status: 403,
                message: 'Forbidden, account not verified by admin',
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
const getAllOpenTripsforRec = async (req, res) => {
    try {
        const date = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
        const [ data ] = await OpenTripsModel.getOpenTripsforRec(date);
        
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
module.exports = {
    createNewOpenTrips,
    getAllOpenTrips,
    getAllOpenTripsById,
    getPartnerProfile,
    getAllOpenTripsforRec
}