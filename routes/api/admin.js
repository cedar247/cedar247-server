const express = require('express')
const{
    CreateConsultant,
    getConsultants,
    getConsultant,
    CreateDoctor, 
    getWards,
    addWard,
    getShifts,
    getAllWardDetails,
    getDoctorTypes,
    CreateUser,
    setConstraints
} = require('../../controllers/adminController')




const router = express.Router()


router.get('/get-shifts', getShifts)// to get all the shifts
router.get('/getConsultants',getConsultants)//to get the consultants
router.post('/consultant',CreateConsultant)// to create consultants
router.post('/doctor',CreateDoctor)// to create doctors

router.post('/add-ward', addWard)// to add a new ward
router.post('/user', CreateUser)// to create a new user

router.get('/getAll',getAllWardDetails)// to get all ward details
router.get('/getDoctorTypes',getDoctorTypes)// to get the types of the doctor
router.post("/set-constraints", setConstraints)
router.get('/',getWards)// to get wards
router.get('/:id',getConsultant)//to get one consultant



module.exports = router

