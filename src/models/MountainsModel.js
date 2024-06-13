const dbPool = require('../config/database')

const getAllMountains = (date) => {
    const SQLQuery = `SELECT mountain.mountain_uuid,
                        mountain.mountain_uuid,
                        mountain.name, 
                        mountain.image_url,
                        mountain.description,
                        mountain.height,
                        mountain.status,
                        mountain.lat,
                        mountain.lon,
                        mountain.magmaCategory,
                        mountain.province, 
                        mountain.harga,
                        mountain.gmaps, 
                        COUNT(ot.open_trip_uuid) total_trip_open
                    FROM mountains mountain
                    LEFT JOIN open_trips ot ON mountain.mountain_uuid = ot.mountain_uuid
                    JOIN open_trip_schedules ots ON ots.open_trip_schedule_uuid=ot.open_trip_schedule_uuid
                    WHERE ots.start_date >= ?
                    group by mountain.mountain_uuid`;
    return dbPool.execute(SQLQuery, [date]);
}

const getMountainById = (id) => {
    const SQLQuery = `SELECT mountain.mountain_uuid,
                        mountain.mountain_uuid,
                        mountain.name, 
                        mountain.image_url,
                        mountain.description,
                        mountain.height,
                        mountain.status,
                        mountain.lat,
                        mountain.lon,
                        mountain.magmaCategory,
                        mountain.province, 
                        mountain.harga,
                        mountain.gmaps, 
                        COUNT(ot.open_trip_uuid) total_trip_open
                      FROM mountains mountain
                      LEFT JOIN open_trips ot
                      ON mountain.mountain_uuid = ot.mountain_uuid
                      WHERE mountain.mountain_uuid = ?
                      GROUP BY mountain.mountain_uuid`;
    return dbPool.execute(SQLQuery, [id]);
  }

const createMountain = (uuid, name, imageUrl, description, height, status, lat, lon, magmaCategory, province, harga, gmaps) => {
    const sql = 'INSERT INTO mountains (mountain_uuid, name, image_url, description, height, status, lat, lon, magmaCategory, province, harga, gmaps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [uuid, name, imageUrl, description, height, status, lat, lon, magmaCategory, province, harga, gmaps];
    return dbPool.execute(sql, values);
};
module.exports = {
    getAllMountains,
    createMountain,
    getMountainById
}