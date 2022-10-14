const express = require('express')
const {
    setDeadline,
    createSchedule,
    getDoctors,
    getDoctorCategories,
    viewCalendar,
} = require('../../controllers/consultantController')

const router = express.Router()

router
    .post('/create-schedule', createSchedule)
    .post('/set-deadline', setDeadline)
    .get('/doctors', getDoctors)
    .get('/get-categories', getDoctorCategories)
    .post('/viewCalendar', viewCalendar)



module.exports = router