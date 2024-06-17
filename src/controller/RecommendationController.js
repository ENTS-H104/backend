const axios = require('axios');
const moment = require('moment-timezone');
const mountainsModel = require ('../models/MountainsModel')
const OpenTripsModel = require ('../models/OpenTripsModel');


const getMountainRecommendation = async (req, res) => {
    try {
      const { user_uid } = req.params;
      try{
          const mountainResponse = await axios.get(`https://api-ml-qb534ptyaq-et.a.run.app/api/recommend-mountain/${user_uid}`);
          const mountainData = mountainResponse.data;
          res.status(200).json({
              status: 200,
              message: "Data successfully fetched",
              data: mountainData["data"]
          });
      }catch{
          const date = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
          const [ data ] = await mountainsModel.getAllMountainsML(date);
          return res.status(500).send({ message: 'Internal server error', data:data });
      }
    } catch (err) {
    //   console.error('Error fetching mountain or weather data:', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
};

const getOpenTripsRecommendation = async (req, res) => {
    try {
      const { user_uid } = req.params;
      try{
          const opentripResponse = await axios.get(`https://api-ml-qb534ptyaq-et.a.run.app/api/recommend-opentrip/${user_uid}`);
          const opentripData = opentripResponse.data;
          res.status(200).json({
              status: 200,
              message: "Data successfully fetched",
              data: opentripData["data"]
          });
      }catch{
          const date = moment.tz("Asia/Jakarta").format("YYYY-MM-DD");
          const [ data ] = await OpenTripsModel.getOpenTripsforRec(date);
          return res.status(500).send({ message: 'Internal server error', data:data });
      }
    } catch (err) {
      return res.status(500).send({ message: 'Internal server error' });
    }
};

module.exports = {
    getMountainRecommendation,
    getOpenTripsRecommendation
}