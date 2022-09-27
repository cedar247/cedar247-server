require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')

// import routes
const workoutRoutes = require("./routes/workouts")
const adminRoutes = require('./routes/api/admin')
const consultantRoutes = require('./routes/api/consultant')
const doctorRoutes = require('./routes/api/doctor')

// express app
const app = express()

// middleware
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
app.use('/api/workouts', workoutRoutes)
app.use('/api/admin/', adminRoutes)
app.use('/api/consultant/', consultantRoutes)
app.use('/api/doctor/', doctorRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port 4000')
        })
    })
    .catch((error) => {
        console.log(error)
    })

