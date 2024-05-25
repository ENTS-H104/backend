const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 401,
            message: 'Bearer token is missing or invalid'
        });
    }

    try {
        // Verify token
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            message: 'Invalid token'
        });
    }
}

module.exports = verifyToken;
