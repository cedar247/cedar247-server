const express = require('express')
const {
    defineRequirements,
    changeClendar
} = require('../../controllers/doctorController')

const router = express.Router()

router
    .post('/defineRequirements',defineRequirements)

router
    .post('/changeClendar',changeClendar)

router
    .post('/changePassword',changeClendar)



module.exports = router