const express = require('express')
const { doLogin } = require('../controllers/authController')
const router = express.Router()


router.post('/dologin',doLogin)// to control the login


module.exports = router