const moment = require('moment-timezone');

const mountainsModel = require ('../models/MountainsModel')
const { Storage } = require('@google-cloud/storage');

// Inisialisasi Google Cloud Storage
const storage = new Storage({
    projectId: 'ents-h104-db',
    keyFilename: '../config/cloud_storage_serviceaccount.json'
});

const bucket = storage.bucket('ents-h104-db');

const getAllMountains = async (req, res) => {
    try {
        const [ data ] = await mountainsModel.getAllMountains();
        
        // Convert UTC timestamps to UTC+7
        // const dataWithLocalTime = data.map(data => ({
        //     ...data,
        //     created_at: moment.utc(data.created_at).tz('Asia/Bangkok').format(),
        //     updated_at: moment.utc(data.updated_at).tz('Asia/Bangkok').format()
        // }));
        
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
const uploadMountain = async (req, res) => {
    try {
      const { name, description, high, status, lat, lon } = req.body;
  
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      const blob = bucket.file(req.file.originalname);
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
          const [result] = await mountainsModel.createMountain(name, publicUrl, description, high, status, lat, lon);
          res.status(200).send({
            message: 'Mountain entry created successfully',
            id: result.insertId,
            name,
            image_url: publicUrl,
            description,
            high,
            status,
            lat,
            lon,
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
    uploadMountain
}
