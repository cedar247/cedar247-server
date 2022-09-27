const express = require('express')
const {
    setDeadline
} = require('../../controllers/consultantController')

const router = express.Router()

router
    .post('/create-schedule')
    .post('/set-deadline', setDeadline)



module.exports = router