const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const mountainsModel = require ('../models/MountainsModel')
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const firestore = require('../config/firestore');
const jwt = require('jsonwebtoken');
// const UsersModel = require ('../models/UsersModel')


// Inisialisasi Google Cloud Storage
const storage = new Storage()

const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);

const getAllMountains = async (req, res) => {
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
        const [ data ] = await mountainsModel.getAllMountains(limit, offset);
        
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


const getMountainWeatherById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mountainsModel.getMountainById(id);

    if (rows.length === 0) {
      return res.status(404).send({ message: 'Mountain not found' });
    }

    const mountain = rows[0];
    const { lat, lon } = mountain;

    // Fetch weather data from OpenWeather API using Axios
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_OPEN_WEATHER_API}&lang=id`);
    const weatherData = weatherResponse.data;

    // Combine mountain data with weather data
    const combinedData = {
      ...mountain,
      weather: {
        temperature: (weatherData.main.temp - 273.15).toFixed(2),
        cuaca: weatherData.weather[0].description,
        // icon: weatherData.weather[0].icon,
      },
    };

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

    if (!id || !user_uid) {
      return res.status(400).json({
        status: 400,
        message: 'Missing required fields',
      });
    }

    // Create a timestamp in Jakarta time
    const createdAt = moment().tz('Asia/Jakarta').toISOString();
    const mountain_clicks_uuid = uuidv4();

    // Data to store
    const data = {
      mountain_clicks_uuid,
      id,
      user_uid,
      createdAt,
    };

    // Reference to the user's document
    const userDocRef = firestore.collection('users_log').doc(user_uid);

    // Reference to the subcollection 'mountain_clicks' within the user's document
    const clicksCollectionRef = userDocRef.collection('mountain_clicks');

    // Add data to the subcollection
    await clicksCollectionRef.add(data);

    return res.status(200).json(combinedData);

  } catch (err) {
    console.error('Error fetching mountain or weather data:', err);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

const uploadMountain = async (req, res) => {
    try {
      const { name, description, height, status, lat, lon, magmaCategory, province, harga, gmaps } = req.body;
  
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      const jakartaTime = moment().tz('Asia/Jakarta').format('YYYYMMDD_HHmmss');
      const blobName = `mountain/${Date.now()}_${jakartaTime}_${req.file.originalname}`;
      const blob = bucket.file(blobName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });
  
      blobStream.on('error', (err) => {
        console.error('Blob stream error:', err);
        res.status(500).send({ message: 'Unable to upload image.' });
      });
  
      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  
        try {
          const uuid = uuidv4();
          const [result] = await mountainsModel.createMountain(uuid, name, publicUrl, description, height, status, lat, lon, magmaCategory, province, harga, gmaps);
          res.status(200).send({
            message: 'Mountain entry created successfully',
            id: uuid,
            name,
            image_url: publicUrl,
            description,
            height,
            status,
            lat,
            lon, 
            magmaCategory, 
            province, 
            harga, 
            gmaps
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          res.status(500).send({ message: 'Database error' });
        }
      });
  
      blobStream.end(req.file.buffer);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).send({ message: 'Internal server error' });
    }
  };

module.exports = {
    getAllMountains,
    uploadMountain,
    getMountainWeatherById
}
