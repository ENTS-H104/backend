const dbPool = require('../config/database')

const getAllMountains = () => {
    const SQLQuery = `SELECT 
                        mountains.mountain_id, 
                        mountains.name, 
                        mountains.image_url,
                        mountains.description,
                        mountains.high,
                        mountains.status,
                        mountains.lat,
                        mountains.lon
                       FROM mountains`;
    return dbPool.execute(SQLQuery);
}
const createMountain = (name, imageUrl, description, high, status, lat, lon) => {
    const sql = 'INSERT INTO mountains (name, image_url, description, high, status, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, imageUrl, description, high, status, lat, lon];
    return dbPool.execute(sql, values);
};
module.exports = {
    getAllMountains,
    createMountain
}