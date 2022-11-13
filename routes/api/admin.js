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
    setConstraints,
    getNumConsecGroups,
    setConsecGroups,
    getWardConsultants,
    getWardDoctors,
    DeleteWard,
    getAllShifts
} = require('../../controllers/adminController')




const router = express.Router()


router.get('/get-shifts', getShifts)// to get all the shifts
router.get('/get-num-consec-groups', getNumConsecGroups) // get number of consecutive Groups
router.get('/getConsultants',getConsultants)//to get the consultants
router.post('/consultant',CreateConsultant)// to create consultants
router.post('/doctor',CreateDoctor)// to create doctors

router.post('/add-ward', addWard)// to add a new ward
router.post('/user', CreateUser)// to create a new user

router.get('/getAll',getAllWardDetails)// to get all ward details
router.post('/getDoctorTypes',getDoctorTypes)// to get the types of the doctor
router.post("/set-constraints", setConstraints) // set constraints
router.post("/set-consec-groups", setConsecGroups) // set consecutive groups
router.get("/get-all-shifts", getAllShifts)
router.get('/',getWards)// to get wards
router.get('/:id',getConsultant)//to get one consultant
router.post('/getAllCons',getWardConsultants)//to get ward consultant
router.post('/getAllDocs',getWardDoctors)//to get one consultant
router.post('/DeleteWard',DeleteWard)


module.exports = router

