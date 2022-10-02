const Consultant = require('../models/consultantModel')
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require('../models/shiftModel')
const mongoose = require('mongoose')

//all consultant 
const getConsultants = async (req,res)=>{

    try{
    const consultant = await Consultant.find({}).sort({createdAt:-1})

    res.status(200).json(consultant)
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}


//all consultant 


const getWards = async (req,res)=>{

    try{
    const consultant = await Ward.find({},{name:1}).sort({createdAt:-1})

    res.status(200).json(consultant)
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}


const getAllWardDetails = async (req,res)=>{

    try{
    const consultant = await Ward.find({},{name:1}).sort({})

    res.status(200).json(consultant)
    }catch(error){
        res.status(400).json({msg: error.message})
    }

}
//create consultant

const CreateConsultant = async (req,res)=>{
    console.log(req.body)
    const {name,phoneNumber,email,WardID} = req.body
  
    try{
    const consultant = await Consultant.create(    
        {name,phoneNumber,email,WardID}
    )

    res.status(200).json({msg: "Success"})
    }catch(error){
        return res.status(400).json({msg: error.message})
    }

}


const CreateDoctor = async (req,res)=>{
    console.log(req.body)
    const {name,phoneNumber,email,category,WardID} = req.body
    try{
    const consultant = await Doctor.create({name,phoneNumber,email,category,WardID})
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

const addWard = async (req, res) => {
    const session = req.session;
    const {name, number, doctorCategories, shifts} = req.body;
    const shiftIds = []

    const categories = Object.keys(doctorCategories).filter(key => doctorCategories[key] === true);


    try {
        for(let i = 0; i < shifts.length; i++) {
            const shift = await Shift.create(shifts[i])
            shiftIds.push(shift._id)
        }
        const ward = await Ward.create({
            name: name,
            number: number,
            shifts: shiftIds,
            doctorCategories: categories,
        })
        const wardCreated = await Ward.create(ward)
        session.wardId = wardCreated._id;
        console.log(req.session)
        session.id  = 1
        res.status(201).json({msg: "succcess"})
    } catch (error) {
        res.status(400).json({error: error.message})
    }

}

const getShifts = async (req, res) => {
    // const { wardId } = req.params;
    const session = req.session;
    // const wardId = session.wardId;
    const wardId = '6338771f6b128f6cfffef6b3';
    
    if (!mongoose.Types.ObjectId.isValid(wardId)) {
        return res.status(404).json({error: "No such ward"})
    }

    const ward = await Ward.findById(wardId)

    if(!ward) {
        return res.status(404).json({error: "No such ward"})
    }

    const shifts = ward.shifts;

    if(shifts === []) {
        return res.status(200).json({msg: "No shifts"})
    }

    const shiftDetails = [];

    for(let i = 0; i < shifts.length; i++) {
        const shiftId = shifts[i]

        if (!mongoose.Types.ObjectId.isValid(shiftId)) {
            // return res.status(404).json({error: "No such ward"})
            console.log("No such shift")
        } else {
            const shift = await Shift.findById(shiftId)
            if(!shift) {
                console.log("No such shift")
            } else {
                shiftDetails.push(shift)
            }
        }
    }

    return res.status(200).json(shiftDetails)
}

module.exports =  {
    CreateConsultant,
    getConsultants,
    getConsultant,
    CreateDoctor,
    getWards,
    addWard,
    getShifts,
    getAllWardDetails

}