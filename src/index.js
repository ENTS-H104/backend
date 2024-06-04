require('dotenv').config();
const PORT = process.env.PORT
const express = require('express');
const cors = require('cors'); 
const middlewareLogRequest = require('./middleware/log')

const usersRoutes = require('./routes/users')
const userRolesRoutes = require('./routes/userRoles') 
const mountainsRoutes = require('./routes/mountains')
const partnerRolesRoutes = require('./routes/partnerRoles')
const partnerRoutes = require('./routes/partners')
const openTripsRoutes = require('./routes/openTrips')
const SchedulesDescRoutes = require('./routes/SchedulesDescRoutes')
const FaqsRoutes = require('./routes/FaqsRoutes')
const searcOpenTripsRoutes = require('./routes/searchOpenTrips')
const transactionRoutes = require('./routes/transaction')
const paymentGatewayRoutes = require('./routes/paymentGateway')
const MessagesRoutes = require('./routes/MessagesRoutes')

const app = express();

// Middleware
app.use(cors());
app.use(middlewareLogRequest)
app.use(express.json())

// Routes
app.use('/api/users', usersRoutes)
app.use('/users/user-roles', userRolesRoutes)

app.use('/api/partners', partnerRoutes)
app.use('/api/partners/partner-roles', partnerRolesRoutes)
 
app.use('/api/mountains', mountainsRoutes)

app.use('/api/open-trips', openTripsRoutes)
app.use('/api/open-trips/schedules', SchedulesDescRoutes)
app.use('/api/open-trips/faqs', FaqsRoutes)

app.use('/api/search-ot', searcOpenTripsRoutes)

app.use('/api/transaction', transactionRoutes)
app.use('/api/payment-gateway', paymentGatewayRoutes)

app.use('/api/messages', MessagesRoutes)

// Domain Response
app.get('/api', (req, res) => {
    res.status(200).send('<h1>HighKing Api</h1>');
});

app.listen(PORT, () => {
    console.log(`Server running`)
})