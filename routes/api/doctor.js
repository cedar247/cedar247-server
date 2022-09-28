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



module.exports = router