const express = require('express')
const {

} = require('../../controllers/adminController')

const router = express.Router()

router
    .get('/')
    .get('/add-ward')
    .post('/add-ward')




module.exports = router