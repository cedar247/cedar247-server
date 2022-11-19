require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')
const session = require('express-session')

// import routes
const workoutRoutes = require("./routes/workouts")
const adminRoutes = require('./routes/api/admin')
const consultantRoutes = require('./routes/api/consultant')
const doctorRoutes = require('./routes/api/doctor')
const authRoutes = require('./routes/auth')

// express app
const app = express()

app.use(session({
    secret : 'ABCDefg',
    resave : false,
    saveUninitialized : true,
    cookie: { maxAge: 3*24*60*60*1000 },
    expires: new Date(Date.now() + (3*24*60*60*1000))
}));

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
// middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
app.use('/api/admin/', adminRoutes)//admin route
app.use('/api/consultant/', consultantRoutes)//consultant routes
app.use('/api/doctor/', doctorRoutes)//doctor routes
app.use('/api/auth/', authRoutes)//authentication routes
 
// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port ' + process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })

