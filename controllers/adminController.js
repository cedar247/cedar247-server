const Consultant = require('../models/consultantModel')
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require('../models/shiftModel')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
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

// to get all consultant 
const getWardConsultants = async (req, res) => {
    console.log("All doc in ksdjlkajslkdf controller");
    console.log(req.body)

    try {
        const consultant = await Consultant.find({WardID:req.body._id}).sort({ createdAt: -1 })

        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}

// to get all consultant 
const getWardDoctors = async (req, res) => {
    console.log("All doc in      vksdfasdifi controller");
    console.log(req.body)
    try {
        const doctor = await Doctor.find({WardID:req.body._id}).sort({ createdAt: -1 })

        res.status(200).json(doctor)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}


// to get all ward names
const getWards = async (req, res) => {

    try {
        const consultant = await Ward.find({status: 2}, { name: 1 }).sort({ createdAt: -1 })

        res.status(200).json(consultant)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}

const DeleteWard = async (req, res) => {
    console.log(req.body);
    console.log('Hi i am gghere');
    try {
        const ward = await Ward.deleteOne({_id:req.body.wardID})
        const cons = await Consultant.deleteMany({WardID:req.body.wardID})
        const doc = await Doctor.deleteMany({WardID:req.body.wardID})
        res.status(200).json(ward);
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }

}
// to get the doctor types
const getDoctorTypes = async (req, res) => {
    const wardId = req.body.WardID
    console.log('HI there');
    console.log(req.body);

    try {
        const ward = await Ward.findById(wardId); // get the ward
        if(!ward) {
            return res.status(404).json({error: "No such ward"})
        }

        const doctorCategories = ward.doctorCategories
        console.log(doctorCategories)

        res.status(200).json(doctorCategories)
    } catch (error) {
        res.status(400).json({ msg: error.message })
    }

}

//to get all the details of the wards
const getAllWardDetails = async (req, res) => {

    try {
        const consultant = await Ward.find({status: 2}).sort({})

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
    // console.log(req.body)
    const { name, phoneNumber, email, category, WardID, NewCategory } = req.body
    // const category = NewCategory != "" ? NewCategory : category1
    // console.log(category)
    //gets the type of the user
    const type = process.env.REACT_APP_DOCTOR_TYPE
    // console.log(type);
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

const validate_shifts = (shifts) => {
    /*
        validate shifts
    */
   console.log(shifts)
    const shift_times = [] // array to store times of shifts
    // iterate shifts
    for(let i = 0; i < shifts.length; i++) {
        let startTime = shifts[i]["startTime"].split(":").join("")
        let endTime = shifts[i]["endTime"].split(":").join("")
        const time_duration = {}

        if(startTime.startsWith("0")) { // before 12pm
            startTime = startTime.slice(1)
        }
        if(endTime.startsWith("0")) { // before 12pm
            endTime = endTime.slice(1)
        }

        // convert to interger
        time_duration["startTime"] = parseInt(startTime)
        time_duration["endTime"] = parseInt(endTime)

        shift_times.push(time_duration)
    }

    // sort shifts according to start Time
    shift_times.sort(
        function(x, y) {
            return x.startTime - y.startTime
        }
    )

    // check consecutive shifts
    for(let i = 0; i < shift_times.length - 1; i++) {
        if(shift_times[i].endTime > shift_times[i+1].startTime) {
            return false
        }
    } 
    
    return true
}

const addWard = async (req, res) => {
    // const session = req.session;
    const { name, number, doctorCategories, shifts, maxLeaves, numConsecutiveGroupShifts,numOfShifts } = req.body;
    const shiftIds = []
    const bearerHeader = req.header('Authorization');
    // const user = {} 

    try {
        const shifts_list = shifts.slice(0, numOfShifts)
        console.log(shifts_list)
        // decode the jwt token
        if(!bearerHeader) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]
        const user = jwt.verify(token, process.env.SECRET);

        if(!user || user.type !== "Admin") {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        // check if ward name exists in the system
        const ward_exist = await Ward.findOne({name: name, status:2})

        if(ward_exist) { 
            return res.status(200).json({error: "Ward name exists"})
        }

        const ward_exist_num = await Ward.findOne({number: number, status:2})

        if(ward_exist_num) {
            return res.status(200).json({error: "Ward number exists"})
        }
        
        // validate shift details
        const valid_shifts = validate_shifts(shifts_list)

        if(!valid_shifts) {
            return res.status(200).json({error: "Invalid time intervals for shifts"})
        }

        // doctor categories of the ward
        const categories = Object.keys(doctorCategories).filter(key => doctorCategories[key] === true);

        if(categories === undefined || categories.length == 0) {
            return res.status(200).json({error: "Need to select atleast one doctor category"})
        }
    
        for (let i = 0; i < shifts_list.length; i++) {
            if(shifts_list[i]["shiftId"] !== undefined) { // already existing shift
                shiftIds.push(shifts_list[i]["shiftId"])
            } else { // need to create a shift
                const shift = await Shift.create(shifts_list[i])
                shiftIds.push(shift._id)
            }
            
        }

        const max_leaves = parseInt(maxLeaves)
        const num_con_shifts = parseInt(numConsecutiveGroupShifts)

        const constraints = {
            maxLeaves: max_leaves,
            numConsecutiveGroupShifts: num_con_shifts
        }

        const ward = await Ward.create({
            name: name,
            number: number,
            shifts: shiftIds,
            doctorCategories: categories,
            constraints: constraints,
            status: 1
        }) // create the ward

        const wardCreated = await Ward.create(ward)
        user.wardId = wardCreated._id;
        const new_token = jwt.sign(user,process.env.SECRET)
        // // console.log(new_token)
        return res.status(201).json({ msg: "succcess", token: new_token })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }

}

const setConstraints = async (req, res) => {
    const data = req.body;
    const bearerHeader = req.header('Authorization'); // header

    try {

        // decode the jwt token
        if(!bearerHeader) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]
        const user = jwt.verify(token, process.env.SECRET);

        if(!user || user.type !== "Admin") {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        if(!user.wardId) {
            return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
        }

        const wardId = user.wardId; // get the ward id from token

        if (!mongoose.Types.ObjectId.isValid(wardId)) { // check if ward id exists in wards collection
            return res.status(404).json({ error: "No such ward" })
        }
        
        const ward = await Ward.findById(wardId)
    
        if (!ward) {
            return res.status(404).json({ error: "No such ward" })
        }

        // consecutive groups of shifts
        const consecGroups = []
        const consecShifts = data.consecGroups;
        for(let i = 0; i < consecShifts.length; i++) {
            const consecGroup_current = []
            
            for(let j = 0; j < consecShifts[i].length; j++) {
                // add checked shifts to consecGroup 
                if(consecShifts[i][j].checked === true) {
                    consecGroup_current.push(consecShifts[i][j].id)
                }
                
            }

            // check if there is atleast two shifts in the consecutive group
            if(consecGroup_current.length < 2) {
                return res.status(200).json({ error: "Select atleast two shifts in consecutive shift groups"})
            }
            // add consecutive group to consecutive Groups
            consecGroups.push(consecGroup_current)
        }

        const specialShifts = []

        // add special shifts to specialShifts
        for(let i = 0; i < data.shiftTypes.length; i++){
            if(data.shiftTypes[i].checked === true) {

                // check if number of days has selected for vacation
                if(data.shiftTypes[i].vacation == 0) {
                    return res.status(200).json({ error: "Select number of vacation days for each special shiftsy"})
                }
                specialShifts.push({
                    shift: data.shiftTypes[i].id,
                    vacation: data.shiftTypes[i].vacation
                })
            }   
        }

        const constraints = ward.constraints;
        constraints.specialShifts = specialShifts;
        constraints.consecutiveGroups = consecGroups;
        console.log(constraints)
        const wardUpdated = await Ward.findOneAndUpdate({_id: wardId}, {
            constraints: constraints,
            status: 2
        });

        return res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

const getWardId = async (user) => {
    if(user.type === "Admin") {
        if(!user.wardId) {
            return false
        }
        return user.wardId
    }

    const consultantId = user._id;

    if(!mongoose.Types.ObjectId.isValid(consultantId)) {
      return false
    }

    const consultant = await Consultant.findById(consultantId) // get the details of the consultant

    if(!consultant) { // no such consultant
      return false
    }

    if(!consultant.WardID) {
        return false // check if status 401 is matching with the error
    }

    const wardId = consultant.WardID; // get the ward id from token
    return wardId
}

const getShifts = async (req, res) => {
    const bearerHeader = req.header('Authorization');

    try {
        if(!bearerHeader) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]
        const user = jwt.verify(token, process.env.SECRET);

        if(!user || !(user.type === "Admin" || user.type === "CONSULTANT")) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const wardId = await getWardId(user);
        if(!wardId) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

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
    } catch(error) {
        return res.status(400).json({ error: error.message })
    }
}

const getNumConsecGroups = async (req, res) => {
    const bearerHeader = req.header('Authorization'); // header

    try {
        // decode the jwt token
        if(!bearerHeader) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]
        const user = jwt.verify(token, process.env.SECRET);

        if(!user || user.type !== "Admin") {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        if(!user.wardId) {
            return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
        }

        const wardId = user.wardId; // get the ward id from token

        if (!mongoose.Types.ObjectId.isValid(wardId)) {
            return res.status(404).json({ error: "No such ward" })
        }
    
        const ward = await Ward.findById(wardId)
    
        if (!ward) {
            return res.status(404).json({ error: "No such ward" })
        }

        const numConsecGroups = ward.constraints.numConsecutiveGroupShifts

        // if(numConsecGroups) {
            return res.status(200).json({ numConsecGroups: numConsecGroups })
        // }
    } catch (error) {
        return res.status(400).json({error: error.message})
    }

}

const setConsecGroups = async (req, res) => {
    const data = req.body;
    const bearerHeader = req.header('Authorization'); // header
    
    try{
        // decode the jwt token
        if(!bearerHeader) {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1]
        const user = jwt.verify(token, process.env.SECRET);

        if(!user || user.type !== "Admin") {
            return res.status(401).json({ error: "Unauthorized access"})
        }

        if(!user.wardId) {
            return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
        }

        const wardId = user.wardId; // get the ward id from token
        
        if (!mongoose.Types.ObjectId.isValid(wardId)) {
            return res.status(404).json({ error: "No such ward" })
        }
    
        const ward = await Ward.findById(wardId)
    
        if (!ward) {
            return res.status(404).json({ error: "No such ward" })
        }

        const consecGroups = []
        for(let i = 0; i < data.length; i++) {
            const consecGroup_current = []
            
            for(let j = 0; j < data[i].length; j++) {
                // add checked shifts to consecGroup 
                if(data[i][j].checked === true) {
                    consecGroup_current.push(data[i][j].id)
                }
                
            }
            // add consecutive group to consecutive Groups
            consecGroups.push(consecGroup_current)
        }
        const constraints = ward.constraints;
        constraints.consecutiveGroups = consecGroups;
        const wardUpdated = await Ward.findOneAndUpdate({_id: wardId}, {
            constraints: constraints
        })

        // console.log(wardUpdated.constraints.consecutiveGroups)
        return res.status(201).json({msg: "success"})
    } catch(error) {
        return res.status(400).json({ error: error.message})
    }

    
}

// get all shifts from database
const getAllShifts = async (req, res) => {

    try {
        const shifts = await Shift.find({})
        return res.status(200).json({shifts: shifts})
    } catch(error) {
        return res.status(400).json({ error: error.message })
    }
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
    setConstraints,
    getNumConsecGroups,
    setConsecGroups,
    getWardConsultants,
    getWardDoctors,
    DeleteWard,
    getAllShifts
}