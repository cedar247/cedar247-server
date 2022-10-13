const express = require('express')
const{CreateConsultant,
    getConsultants,
    getConsultant,
    CreateDoctor, 
    getWards,
    addWard,
    getShifts,
    getAllWardDetails,
    getDoctorTypes,
    CreateUser,
} = require('../../controllers/adminController')




const router = express.Router()



router.get('/getConsultants',getConsultants)//to get the consultants
router.post('/consultant',CreateConsultant)// to create consultants
router.post('/doctor',CreateDoctor)// to create doctors
router.get('/',getWards)// to get wards
router.post('/add-ward', addWard)// to add a new ward
router.post('/user', CreateUser)// to create a new user
router.get('/get-shifts', getShifts)// to get all the shifts
router.get('/getAll',getAllWardDetails)// to get all ward details
router.get('/getDoctorTypes',getDoctorTypes)// to get the types of the doctor
router.get('/:id',getConsultant)//to get one consultant



module.exports = router

