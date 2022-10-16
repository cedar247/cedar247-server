const express = require('express')
const {
    defineRequirements,
    changeClendar,
    changePassword,
    getShifts,
    getDoctorShifts,
    setSwappingShifts
} = require('../../controllers/doctorController')

const router = express.Router()

router.post('/defineRequirements',defineRequirements)

router.post('/changeClendar',changeClendar)

router.post('/changePassword',changePassword)

router.post('/getShifts', getShifts)

router.post('/getDoctorShifts', getDoctorShifts)

router.post('/setSwappingShifts', setSwappingShifts)


module.exports = router