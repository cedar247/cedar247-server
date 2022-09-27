const express = require('express')
const {
    defineRequirements
} = require('../../controllers/doctorController')

const router = express.Router()

router
    .post('/defineRequirements',defineRequirements)



module.exports = router