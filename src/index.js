require('dotenv').config();
const PORT = process.env.PORT
const express = require('express');
const cors = require('cors'); 
const middlewareLogRequest = require('./middleware/log')

const usersRoutes = require('./routes/users')
const userRolesRoutes = require('./routes/userRoles') 

const app = express();

// Middleware
app.use(cors());
app.use(middlewareLogRequest)
app.use(express.json())

// Routes
app.use('/users', usersRoutes)
app.use('/users/user-roles', userRolesRoutes)


// Domain Response
app.get('/', (req, res) => {
    res.status(200).send('<h1>HighKing Api, is ready to use!</h1>');
});

app.listen(PORT, () => {
    console.log(`Server running`)
})