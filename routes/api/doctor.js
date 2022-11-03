const express = require('express')
const {
    defineRequirements,
    changeClendar,
    changePassword,
    getShifts,
    getDoctorShifts,
    setSwappingShifts,
    getRequests,
    setRequestResponse,
} = require('../../controllers/doctorController')

const router = express.Router()

router.post('/defineRequirements',defineRequirements)

router.post('/changeClendar',changeClendar)

router.post('/changePassword',changePassword)

router.post('/getShifts', getShifts)

router.post('/getDoctorShifts', getDoctorShifts)

router.post('/setSwappingShifts', setSwappingShifts)

router.post('/getRequests', getRequests)

router.post('/setRequestResponse', setRequestResponse)

module.exports = router