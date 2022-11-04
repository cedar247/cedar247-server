const express = require('express')
const {
    setDeadline,
    createSchedule,
    getDoctors,
    getDoctorCategories,
    getRequests,
    setRequestResponse,
} = require('../../controllers/consultantController')

const router = express.Router()

router
    .post('/create-schedule', createSchedule)
    .post('/set-deadline', setDeadline)
    .get('/doctors', getDoctors)
    .get('/get-categories', getDoctorCategories)
    .post('/getRequests', getRequests)
    .post('/setRequestResponse', setRequestResponse)
    


module.exports = router