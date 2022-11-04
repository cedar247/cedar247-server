const express = require('express')
const {
    setDeadline,
    createSchedule,
    getDoctors,
    getDoctorCategories,
    getRequests,
    setRequestResponse,
    viewCalendar,
    changePassword,
} = require('../../controllers/consultantController')

const router = express.Router()

router
    .post('/create-schedule', createSchedule)
    .post('/set-deadline', setDeadline)
    .get('/doctors', getDoctors)
    .get('/get-categories', getDoctorCategories)
    .post('/viewCalendar', viewCalendar)
    .post('/getRequests', getRequests)
    .post('/setRequestResponse', setRequestResponse)
    .post('/changePassword',changePassword)



module.exports = router