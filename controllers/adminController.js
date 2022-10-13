const Consultant = require('../models/consultantModel')
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require('../models/shiftModel')
const mongoose = require('mongoose')
const User = require('../models/userModel')
require('dotenv').config()

// to get all consultant 
const getConsultants = async (req, res) => {

    try {
        const consultant = await Consultant.find({}).sort({ createdAt: -1 })

        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}


// to get all ward names
const getWards = async (req, res) => {

    try {
        const consultant = await Ward.find({}, { name: 1 }).sort({ createdAt: -1 })

        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}
// to get the doctor types
const getDoctorTypes = async (req, res) => {

    try {
        const doctor = await Doctor.find({}, { category: 1 }).distinct('category')

        res.status(200).json(doctor)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}

//to get all the details of the wards
const getAllWardDetails = async (req, res) => {

    try {
        const consultant = await Ward.find({}).sort({})

        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}
//to create consultant

// const CreateConsultant = async (req,res)=>{
//     console.log(req.body)
//     const {name,phoneNumber,email,WardID} = req.body
//     const type = process.env.REACT_APP_CONSULTANT_TYPE
//     try{
//         const user = await User.create({name,email,type})
//         if(user){
//           const  userId = user._id
//             const consultant = await Consultant.create({name,phoneNumber,email,WardID,userId})
//             if(consultant){
//                 const addinward = await Ward.findOneAndUpdate({_id:req.body.WardID},{$push :{
//                     consultants : consultant._id
//                 }})
//                 if(addinward){return res.status(200).json({msg: "Success"})} 
//             }
//         }
//         }catch(error){
//            return  res.status(400).json({msg: error.message})
//         }

// }

// to creaate consultant


// to
const CreateConsultant = async (req, res) => {
    const session = await Consultant.startSession();
    session.startTransaction();
    console.log(req.body)
    const { name, phoneNumber, email, WardID } = req.body
    //gets the type of the user
    const type = process.env.REACT_APP_CONSULTANT_TYPE
    try {
        const opts = { session };
        //creates the user
        const user = await User.create({ name, email, type });
        const userId = user._id
        //creates the  consultant
        const consultant = await Consultant.create({ name, phoneNumber, email, WardID, userId })
        //add the consultant in the ward
        const addinward = await Ward.findOneAndUpdate({ _id: req.body.WardID }, {
            $push: {
                consultants: consultant._id
            }
        });

        if (consultant) {

            if (addinward) { return res.status(200).json({ msg: "Success" }) }
        }
        await session.commitTransaction();
        session.endSession();

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: error.message })
    }

}

//to create Doctor
const CreateDoctor = async (req, res) => {
    const session = await Doctor.startSession();
    session.startTransaction();
    console.log(req.body)
    const { name, phoneNumber, email, category, WardID, NewCategory } = req.body
    // const category = NewCategory != "" ? NewCategory : category1
    console.log(category)
    //gets the type of the user
    const type = process.env.REACT_APP_DOCTOR_TYPE
    console.log(type);
    try {
        const opts = { session };
         //creates the user
        const user = await User.create({ name, email, type })
        const userId = user._id
         //creates the Doctor
        const doctor = await Doctor.create(
            { name, phoneNumber, email, category, WardID, userId })
            //to add doctor into the ward
        const addinward = await Ward.findOneAndUpdate({ _id: req.body.WardID }, {
            $push: {
                doctors: doctor._id
            }
        })


        if (doctor) {

            if (addinward) { return res.status(200).json({ msg: "Success" }) }
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: error.message })
    }


}



const CreateUser = async (req, res) => {
    console.log(req.body)
    const { name, email, type } = req.body
    // const category = NewCategory ? NewCategory : category1
    // console.log(category)
    try {
        const consultant = await User.create({ name, email, type })
        return res.status(200).json(consultant)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }

}
//get single consultant 

const getConsultant = async (req, res) => {
    const { id } = req.params
    try {
        const consultant = await Consultant.findById(id)
        if (!consultant) {
            return res.status(404).json({ error: "No such Counsultant" })
        }
        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}

const addWard = async (req, res) => {
    const session = req.session;
    const { name, number, doctorCategories, shifts } = req.body;
    const shiftIds = []

    const categories = Object.keys(doctorCategories).filter(key => doctorCategories[key] === true);


    try {
        for (let i = 0; i < shifts.length; i++) {
            const shift = await Shift.create(shifts[i])
            shiftIds.push(shift._id)
        }
        const ward = await Ward.create({
            name: name,
            number: number,
            shifts: shiftIds,
            doctorCategories: categories
        })
        const wardCreated = await Ward.create(ward)
        session.wardId = wardCreated._id;
        console.log(req.session)
        session.id = 1
        res.status(201).json({ msg: "succcess" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

}

const getShifts = async (req, res) => {
    // const { wardId } = req.params;
    const session = req.session;
    // const wardId = session.wardId;
    const wardId = '6338771f6b128f6cfffef6b3';

    if (!mongoose.Types.ObjectId.isValid(wardId)) {
        return res.status(404).json({ error: "No such ward" })
    }

    const ward = await Ward.findById(wardId)

    if (!ward) {
        return res.status(404).json({ error: "No such ward" })
    }

    const shifts = ward.shifts;

    if (shifts === []) {
        return res.status(200).json({ msg: "No shifts" })
    }

    const shiftDetails = [];

    for (let i = 0; i < shifts.length; i++) {
        const shiftId = shifts[i]

        if (!mongoose.Types.ObjectId.isValid(shiftId)) {
            // return res.status(404).json({error: "No such ward"})
            console.log("No such shift")
        } else {
            const shift = await Shift.findById(shiftId)
            if (!shift) {
                console.log("No such shift")
            } else {
                shiftDetails.push(shift)
            }
        }
    }

    return res.status(200).json(shiftDetails)
}


module.exports = {
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

}