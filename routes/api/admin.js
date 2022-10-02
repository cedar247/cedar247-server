const express = require('express')
const{CreateConsultant,
    getConsultants,
<<<<<<< HEAD
    getConsultant,
    CreateDoctor, 
    getWards,
    addWard,
    getShifts
} = require('../../controllers/adminController')
=======
    getConsultant,CreateDoctor, getWards, getAllWardDetails} = require('../../controllers/adminController')
>>>>>>> dc74f59 (new changes)

const router = express.Router()



router.get('/getConsultants',getConsultants)

router.post('/consultant',CreateConsultant)
router.post('/doctor',CreateDoctor)
router.get('/',getWards)
router.post('/add-ward', addWard)
// router.get('/get-shifts/:wardId', getShifts)
router.get('/get-shifts', getShifts)
router.get('/getAll',getAllWardDetails)
router.get('/:id',getConsultant)




router.delete('/:id',(req,res)=>{

    res.json({msg:'DELETE a workout'})
})


router.patch('/:id',(req,res)=>{

    res.json({msg:'UPDATE a workout'})
})


module.exports = router

