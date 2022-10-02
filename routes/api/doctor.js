const express = require('express')
const {
    defineRequirements,
    changeClendar,
    changePassword,
} = require('../../controllers/doctorController')

const router = express.Router()

router
    .post('/defineRequirements',defineRequirements)

router
    .post('/changeClendar',changeClendar)

router
    .post('/changePassword',changePassword)



module.exports = router