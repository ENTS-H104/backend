const midtransClient = require('midtrans-client');

// Create Snap API instance
let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,	    
    clientKey: process.env.CLIENT_KEY
});

module.exports = snap;
