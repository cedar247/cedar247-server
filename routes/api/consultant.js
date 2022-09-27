const express = require('express')
const {
    setDeadline,
    createSchedule,
    getDoctors
} = require('../../controllers/consultantController')

const router = express.Router()

router
    .post('/create-schedule', createSchedule)
    .post('/set-deadline', setDeadline)
    .get('/doctors', getDoctors)



module.exports = router