const express = require('express')
const{CreateConsultant,
    getConsultants,
    getConsultant,CreateDoctor, getWards} = require('../../controllers/adminController')

const router = express.Router()



router.get('/getConsultants',getConsultants)
router.get('/:id',getConsultant)
router.post('/consultant',CreateConsultant)
router.post('/doctor',CreateDoctor)
router.get('/',getWards)



router.delete('/:id',(req,res)=>{

    res.json({msg:'DELETE a workout'})
})


router.patch('/:id',(req,res)=>{

    res.json({msg:'UPDATE a workout'})
})


module.exports = router

