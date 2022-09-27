const Consultant = require('../models/consultantModel')
const Doctor = require('../models/doctorModel')


//all consultant 
const getConsultants = async (req,res)=>{

    try{
    const consultant = await Consultant.find({}).sort({createdAt:-1})

    res.status(200).json(consultant)
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}


//create consultant

const CreateConsultant = async (req,res)=>{
    const {name,phoneNumber,email,WardID} = req.body

    try{
    const consultant = await Consultant.create({name,phoneNumber,email,WardID})

    res.status(200).json(consultant)
    }catch(error){
        return res.status(400).json({msg: error.message})
    }

}


const CreateDoctor = async (req,res)=>{
    const {name,phoneNumber,email,category,WardID} = req.body

    try{
    const consultant = await Consultant.create({name,phoneNumber,email,category,WardID})
    res.status(200).json({msg: "Success"})
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}


//get single consultant 

const getConsultant = async (req,res)=>{
    const {id} = req.params
    try{
    const consultant = await Consultant.findById(id)
        if(!consultant){
            return res.status(404).json({error: "No such Counsultant"})
        }
    res.status(200).json(consultant)
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}

module.exports =  {CreateConsultant,
    getConsultants,
    getConsultant,
    CreateDoctor}