const request = require("request");
const mongoose = require('mongoose');
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Ward = require("../models/wardModel");
const Leave = require("../models/leaveModel");
const Shift = require("../models/shiftModel");
const Requirement = require("../models/requirementModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const SwappingShifts = require("../models/swappingShiftModel");
const Schedule = require("../models/scheduleModel");
const bcrypt = require('bcrypt');

//defined the user requirements 
const defineRequirements = async (req, res) => {
    console.log("data recieved");
    const data = req.body;
    console.log(data);

    const { id, date, shiftTypes } = req.body;
    // const _id ='633ab0f123be88c950fb8a89';
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid user" });
    }
    //get the doctor details according to the id
    const doctor = await Doctor.findById({ _id: id });
    if(!doctor) {
        return res.status(404).json({error: "Invalid user"})
    }

    const leavedshifts = [];
    //map the data from front end with the leaves schema
    for (let i = 0; i < data.length; i++) {
        shiftDetails = await Shift.findById(shiftTypes[i].id);
        if(!shiftDetails) {
            return res.status(400).json({error: "Invalid shift"})
            break;
        }
        if(shiftTypes[i].checked){
            leavedshifts.push(shiftTypes[i].id)
        }
    }

    const leave = {
        date: date,
        shift: leavedshifts,
    };
    //create leave
    try {
        const newleave = await Leave.create(leave);
        const requiredLeaves = [];
        requiredLeaves.push(newleave["_id"].toString());
        const requirement = {
            doctor: id,
            leaves: requiredLeaves,
        };
        //create requirement
        const newRequirement = await Requirement.create(requirement);
        res.status(200).json(newRequirement);
    } catch (error) {
        return res.status(400).json({error: error.message})
    }

};


//get the calendar detais according to user preferences
const changeClendar = async (req, res) => {
    const { id, showAllDoctors } = req.body;
    const appointments = [];
    const owners = [];
    const colors = [
        "#7E57C2",
        "#FF7043",
        "#E91E63",
        "#E91E63",
        "#AB47BC",
        "#FFA726",
    ];

    console.log("data recieved");
    const data = req.body;
    console.log(data);

    // const _id ='633ab0f123be88c950fb8a89';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid user" });
    }
    //get the doctor details according to the id
    const doctor = await Doctor.findById({ _id: id });
    if(!doctor) {
        return res.status(404).json({error: "Invalid user"})
    }
    //get the ward which is doctor belongs
    const ward = await Ward.findById(doctor["WardID"]);
    if(!ward) {
        return res.status(404).json({error: "No ward"})
    }
    //find schedules which is belong to the ward that we selected
    const Schedules = await Schedule.find(doctor["WardID"]);
    if(!Schedules) {
        return res.status(404).json({error: "No Schedule"})
    }
    //get all shifts from above ward
    const allshifts = {};
    for (let i = 0; i < ward["shifts"].length; i++) {
        shiftDetails = await Shift.findById(ward["shifts"][i]);
        if(!shiftDetails) {
            return res.status(400).json({error: "Invalid shift"})
            break;
        }
        allshifts[ward["shifts"][i]] = shiftDetails;
    }
    // console.log(allshifts);
    //get all doctors from above ward
    const alldoctors = {};
    for (let i = 0; i < ward["doctors"].length; i++) {
        doctorDetails = await Doctor.findById(ward["doctors"][i]);
        if(!doctorDetails) {
            return res.status(404).json({error: "Doctor not found"})
            break;
        }
        alldoctors[ward["doctors"][i]] = i + 1;
        owners.push({
            text: doctorDetails["name"],
            id: i + 1,
            color: colors[i % 6],
        });
    }
    for (let i = 0; i < Schedules.length; i++) {
        const shiftOfSchedules = [];

        //get shift of schedules which is belongs to the schedule
        for (let j = 0; j < Schedules[i]["data"].length; j++) {
            const shiftOfSchedule = await ShiftOfASchedule.findById(
                Schedules[i]["data"][j]
            );
            if(!doctorDetails) {
                return res.status(404).json({error: "shift of schedule not found"})
                break;
            }

            const shiftInSchedule = allshifts[shiftOfSchedule["shift"]];
            const doctorsInShift = [];
            // console.log(shiftInSchedule.toString());
            //if show all doctor is false it get only the appoinments whci is belong to current doctor
            if (showAllDoctors == false) {
                if (shiftOfSchedule["doctors"].includes(id)) {
                    console.log("true");
                    doctorsInShift.push(alldoctors[id]);
                    appointments.push({
                        title: shiftInSchedule["name"],
                        date: shiftOfSchedule["date"],
                        startTime: shiftInSchedule["startTime"],
                        endTime: shiftInSchedule["endTime"],
                        id: appointments.length,
                        doctors: doctorsInShift,
                    });
                }
            } else {             //otherwise it gets all the appoinments according to the doctor
                for (let k = 0; k < shiftOfSchedule["doctors"].length; k++) {
                    doctorsInShift.push(
                        alldoctors[shiftOfSchedule["doctors"][k]]
                    );
                }
                appointments.push({
                    title: shiftInSchedule["name"],
                    date: shiftOfSchedule["date"],
                    startTime: shiftInSchedule["startTime"],
                    endTime: shiftInSchedule["endTime"],
                    id: appointments.length,
                    doctors: doctorsInShift,
                });
            }
        }
    }
    console.log("done");
    // console.log(appointments, owners);
    //return the appoinment and owners list
    res.status(200).json([appointments, owners]);
};


//changing doctro password
const changePassword = async (req, res) => {
    console.log("data recieved");
    const data = req.body;
    console.log(data);
    const id ='633ab0f123be88c950fb8a89';

    const hashedPassword = bcrypt.hashSync(data["password"],9);
    console.log(hashedPassword)
    const updateFields = {
        email: data["email"],
        password: hashedPassword,
    };
    console.log(updateFields);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid user" });
    }
    //get the ward which is doctor belongs
    const doctor = await Doctor.findById({ _id: data["id"] });
    if(!doctor) {
        return res.status(404).json({error: "Invalid user"})
    }
    // console.log(doctor);
    try {
        //find and update the doctos email and the password
        const updateDoctor = await User.findOneAndUpdate(
            { _id: doctor["userId"] },
            updateFields
        );
        console.log(updateDoctor);

        if (!updateDoctor) {
            return res.status(404).json({ error: "No such workout" });
        }
        res.status(200).json(updateDoctor);
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
};

//get the shifts belong to the ward of doctor
const getShifts = async (req, res) => {

    const id = '633ab0f123be88c950fb8a89'
    const wardId = '6338771f6b128f6cfffef6b3';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid user" });
    }
    //get the doctor details according to the id
    const doctor = await Doctor.findById({ _id: id });
    if(!doctor) {
        return res.status(404).json({error: "Invalid user"})
    }
    //get the ward which is doctor belongs
    const ward = await Ward.findById(doctor["WardID"]);
    if(!ward) {
        return res.status(404).json({error: "No ward"})
    }
    const shifts = ward.shifts;
    if (shifts === []) {
        return res.status(200).json({ msg: "No shifts" })
    }

    const shiftDetails = [];
    for (let i = 0; i < shifts.length; i++) {
        const shiftId = shifts[i]
        if (!mongoose.Types.ObjectId.isValid(shiftId)) {
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

//get shiftOfSchedules of given dates and return coresponding shift of schedules
const getDoctorShifts = async (req, res) => {
    const data = req.body;
    const id = data.id
    const fromDate = data.fromDate.substr(0, 10);
    const toDate = data.toDate.substr(0, 10);
    console.log(data)
    console.log("data recieved");

    // const _id ='633ab0f123be88c950fb8a89';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log(data,"pass1")
        return res.status(404).json({ error: "Invalid user" });
    }

    const doctor = await Doctor.findById({ _id: data["id"] });
    if(!doctor) {
        console.log(data,"pass2")
        return res.status(404).json({error: "Invalid user"})
    }
    //get the ward which is doctor belongs
    const ward = await Ward.findById(doctor["WardID"]);
    if(!ward) {
        console.log(data,"pass2")
        return res.status(404).json({error: "No ward"});
    }

    const alldoctors = {};
    for (let i = 0; i < ward["doctors"].length; i++) {
        doctorDetails = await Doctor.findById(ward["doctors"][i]);
        if(!doctorDetails) {
            return res.status(404).json({error: "Doctor not found"})
            break;
        }
        alldoctors[ward["doctors"][i]] = doctorDetails["name"];
    }

    const fromShiftOfSchedules = await ShiftOfASchedule.find({ date: fromDate });
    // console.log(fromShiftOfSchedules);
    if(fromShiftOfSchedules.length == 0){
        console.log(data,"pass3")
        return res.status(404).json({error: "no shift Of Schedule"});
    }

    const toShiftOfSchedules = await ShiftOfASchedule.find({ date: toDate });
    // console.log(toShiftOfSchedules);
    if(toShiftOfSchedules.length == 0){
        console.log(data,"pass4")
        return res.status(404).json({error: "no shift Of Schedule"});
    }

    
    const returnFromShiftofSchedules = []
    for (let i = 0; i < fromShiftOfSchedules.length; i++) {
        const shiftOfSchedule = fromShiftOfSchedules[i]
        console.log(data,"pass5")
        if(shiftOfSchedule["doctors"].includes(id)){
            console.log(data,"pass6")
            shiftDetails = await Shift.findById(shiftOfSchedule["shift"]);
            if(!shiftDetails) {
                return res.status(400).json({error: "Invalid shift"})
                break;
            }
            const tempDoctors = []
            for (let j = 0; j < shiftOfSchedule["doctors"].length; j++) {
                console.log(data,"pass7")
                doctorId = shiftOfSchedule["doctors"][j]
                if(id != doctorId){
                    tempDoctors.push({id: doctorId, name: alldoctors[doctorId]});
                }
            }
            console.log(tempDoctors);
            returnFromShiftofSchedules.push({
                id : shiftOfSchedule["_id"],
                doctors : tempDoctors,
                shift: shiftDetails,
            })
        }
    }
    console.log(returnFromShiftofSchedules);
    if(returnFromShiftofSchedules.length == 0){
        console.log(data,"pass8")
        return res.status(404).json({error: "no shift Of Schedule"})
    }
    console.log("pass11");

    const returnToShiftofSchedules = []
    for (let i = 0; i < toShiftOfSchedules.length; i++) {
        const shiftOfSchedule = toShiftOfSchedules[i]
        console.log(shiftOfSchedule, "pass12");

        if(!shiftOfSchedule["doctors"].includes(id)){
            console.log("pass13");
            shiftDetails = await Shift.findById(shiftOfSchedule["shift"]);
            if(!shiftDetails) {
                return res.status(400).json({error: "Invalid shift"})
                break;
            }
            const tempDoctors = []
            for (let j = 0; j < shiftOfSchedule["doctors"].length; j++) {
                doctorId = shiftOfSchedule["doctors"][j]
                tempDoctors.push({id: doctorId, name: alldoctors[doctorId]});
            }
            console.log(tempDoctors);
            returnToShiftofSchedules.push({
                id : shiftOfSchedule["_id"],
                doctors : tempDoctors,
                shift: shiftDetails,
            })
        }
    }
    console.log("pass14");
    console.log(returnToShiftofSchedules);
    if(returnToShiftofSchedules.length == 0){
        return res.status(404).json({error: "no shift Of Schedule"})
    }

    console.log("pass17");
    return res.status(200).json([returnFromShiftofSchedules,returnToShiftofSchedules])
};


const setSwappingShifts = async (req, res) => {
    const data = req.body;
    const fromDoctor = data.id
    const fromShiftofSchedule = data.fromShiftofSchedule
    const toShiftofSchedule = data.toShiftofSchedule
    const toDoctor = data.doctor
    console.log(data)
    console.log("data recieved");

    // const _id ='633ab0f123be88c950fb8a89';

    if (!mongoose.Types.ObjectId.isValid(fromDoctor)) {
        console.log(data,"pass1")
        return res.status(404).json({ error: "Invalid user" });
    }

    if (!mongoose.Types.ObjectId.isValid(fromShiftofSchedule)) {
        console.log(data,"pass1")
        return res.status(404).json({ error: "Invalid ShiftofSchedule" });
    }

    if (!mongoose.Types.ObjectId.isValid(toShiftofSchedule)) {
        console.log(data,"pass1")
        return res.status(404).json({ error: "Invalid ShiftofSchedule" });
    }

    if (!mongoose.Types.ObjectId.isValid(toDoctor)) {
        console.log(data,"pass1")
        return res.status(404).json({ error: "Invalid user" });
    }

    const SwappingShift ={
        fromDoctor: fromDoctor,
        fromShiftofSchedule: fromShiftofSchedule,
        toShiftofSchedule: toShiftofSchedule,
        toDoctor: toDoctor,
        status: true
    }

    
    try{
        const existingSwappingShift = await SwappingShifts.find({
            fromDoctor: fromDoctor,
            fromShiftofSchedule: fromShiftofSchedule,
            toShiftofSchedule: toShiftofSchedule,
            toDoctor: toDoctor
        });
        if(existingSwappingShift.length == 0){
            const newSwappingShift = await SwappingShifts.create(SwappingShift);
            res.status(200).json("Successfull");
        }else{
            res.status(400).json({error: "swapping requiest is exists"});
        }

    } catch (error) {
        return res.status(400).json({error: error.message})
    }
}

module.exports = {
    defineRequirements,
    changeClendar,
    changePassword,
    getShifts,
    getDoctorShifts,
    setSwappingShifts,
};
