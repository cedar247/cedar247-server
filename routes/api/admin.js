const express = require('express')
const{CreateConsultant,
    getConsultants,
    getConsultant} = require('../../controllers/adminController')

const router = express.Router()



router.get('/',getConsultants)
router.get('/:id',getConsultant)
router.post('/consultant',CreateConsultant)
router.post('/doctor',CreateConsultant)

router.delete('/:id',(req,res)=>{

    res.json({msg:'DELETE a workout'})
})


router.patch('/:id',(req,res)=>{

    res.json({msg:'UPDATE a workout'})
})


module.exports = router

