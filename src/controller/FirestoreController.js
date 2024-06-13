const firestore = require('../config/firestore');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

// Endpoint to handle product clicks
const recordMountainClick = async (req, res) => {
    try {
      const { mountain_uuid, user_uid } = req.body;
  
      if (!mountain_uuid || !user_uid) {
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
        mountain_uuid,
        user_uid,
        createdAt,
      };
  
    // Reference to the user's document
    const userDocRef = firestore.collection('users_log').doc(user_uid);

    // Reference to the subcollection 'mountain_clicks' within the user's document
    const clicksCollectionRef = userDocRef.collection('mountain_clicks');

    // Add data to the subcollection
    await clicksCollectionRef.add(data);

      res.status(200).json({
        status: 200,
        message: 'Click recorded',
        data,
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        serverMessage: error.message,
      });
    }
};

const getMountainBasedUserUuid = async (req, res) => {
    try {
      const { user_uid } = req.params;
  
      if (!user_uid) {
        return res.status(400).json({
          status: 400,
          message: 'Missing user_uid',
        });
      }
  
      // Reference to the user's document
      const userDocRef = firestore.collection('users_log').doc(user_uid);
      const clicksCollectionRef = userDocRef.collection('mountain_clicks');
  
      // Get all documents from the 'mountain_clicks' subcollection
      const snapshot = await clicksCollectionRef.get();
  
      if (snapshot.empty) {
        return res.status(404).json({
          status: 404,
          message: 'No clicks found for this user',
          data:[]
        });
      }
  
      let clicks = [];
      snapshot.forEach(doc => {
        clicks.push(doc.data());
      });
  
      res.status(200).json({
        status: 200,
        message: 'Data successfully fetched',
        data: clicks,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        serverMessage: error.message,
      });
    }
};


// Endpoint to handle product clicks
const recordOpenTripClick = async (req, res) => {
    try {
      const { open_trip_uuid, user_uid } = req.body;
  
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
      const data = {
        opentrip_clicks_uuid,
        open_trip_uuid,
        user_uid,
        createdAt,
      };
  
    // Reference to the user's document
    const userDocRef = firestore.collection('users_log').doc(user_uid);

    // Reference to the subcollection 'mountain_clicks' within the user's document
    const clicksCollectionRef = userDocRef.collection('opentrip_clicks');

    // Add data to the subcollection
    await clicksCollectionRef.add(data);

      res.status(200).json({
        status: 200,
        message: 'Click recorded',
        data,
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        serverMessage: error.message,
      });
    }
};

const getOpenTripBasedUserUuid = async (req, res) => {
  try {
    const { user_uid } = req.params;

    if (!user_uid) {
      return res.status(400).json({
        status: 400,
        message: 'Missing user_uid',
      });
    }

    // Reference to the user's document
    const userDocRef = firestore.collection('users_log').doc(user_uid);
    const clicksCollectionRef = userDocRef.collection('opentrip_clicks');

    // Get all documents from the 'mountain_clicks' subcollection
    const snapshot = await clicksCollectionRef.get();

    if (snapshot.empty) {
      return res.status(404).json({
        status: 404,
        message: 'No clicks found for this user',
        data:[]
      });
    }

    let clicks = [];
    snapshot.forEach(doc => {
      clicks.push(doc.data());
    });

    res.status(200).json({
      status: 200,
      message: 'Data successfully fetched',
      data: clicks,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      serverMessage: error.message,
    });
  }
};
  
module.exports = {
    recordMountainClick,
    getMountainBasedUserUuid,
    recordOpenTripClick,
    getOpenTripBasedUserUuid
};