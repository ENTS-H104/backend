const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const mountainsModel = require ('../models/MountainsModel')
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');

// Inisialisasi Google Cloud Storage
const storage = new Storage()

const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET_NAME);

const getAllMountains = async (req, res) => {
    try {
        const date = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
        const [ data ] = await mountainsModel.getAllMountains(date);
        
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

    res.status(200).json(combinedData);
  } catch (err) {
    console.error('Error fetching mountain or weather data:', err);
    res.status(500).send({ message: 'Internal server error' });
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
