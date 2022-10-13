const express = require('express')
const {
    defineRequirements,
    changeClendar,
    changePassword,
    getShifts,
} = require('../../controllers/doctorController')

const router = express.Router()

router
    .post('/defineRequirements',defineRequirements)

router
    .post('/changeClendar',changeClendar)

router
    .post('/changePassword',changePassword)

router
    .post('/getShifts', getShifts)



module.exports = router