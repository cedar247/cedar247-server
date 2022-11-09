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
        const prerequested = await Leave.find(leave);
        if(prerequested.length != 0){
            return res.status(404).json({error: "Leave already requested"});
        }
        const newleave = await Leave.create(leave);
        const requiredLeaves = [];
        requiredLeaves.push(newleave["_id"].toString());
        const requirement = {
            doctor: id,
            leaves: requiredLeaves,
        };
        //create requirement
        const newRequirement = await Requirement.create(requirement);
        console.log(newRequirement,"done")
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
                    // console.log("true");
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
    console.log([appointments, owners], " done");
    // console.log(appointments, owners);
    //return the appoinment and owners list
    res.status(200).json([appointments, owners]);
};


//changing doctro password
const changePassword = async (req, res) => {
    console.log("data recieved");
    const data = req.body;
    console.log(data);
    const id = data.id;
    // const id ='633ab0f123be88c950fb8a89';

    const hashedPassword = bcrypt.hashSync(data["password"],9);
    // console.log(hashedPassword)
    const updateFields = {
        email: data["email"],
        password: hashedPassword,
    };
    
    const updateDoctorFileds = {
        email: data["email"],
    };

    // console.log(updateFields);

    //get the ward which is doctor belongs
    const doctor = await Doctor.findById({ _id: data["id"] });
    if(!doctor) {
        return res.status(404).json({error: "Invalid user"})
    }
    // console.log(doctor);
    try {
        const updateDoctor = await Doctor.findOneAndUpdate(
            { _id: doctor._id },
            updateDoctorFileds
        );
        if (!updateDoctor) {
            return res.status(404).json({ error: "No such doctor" });
        }
        //find and update the doctos email and the password
        const updateUser = await User.findOneAndUpdate(
            { _id: doctor["userId"] },
            updateFields
        );
        // console.log(updateUser);
        if (!updateUser) {
            return res.status(404).json({ error: "No such workout" });
        }
        console.log(updateUser, " done");
        res.status(200).json(updateUser);
    } catch (error) {
        return res.status(400).json({error: error.message})
    }
};

//get the shifts belong to the ward of doctor
const getShifts = async (req, res) => {

    const id = req.body.id

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
        return res.status(404).json({ msg: "No shifts" })
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
    console.log(shiftDetails, " done");
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
        console.log("Invalid user")
        return res.status(404).json({ error: "Invalid user" });
    }

    const doctor = await Doctor.findById({ _id: data["id"] });
    if(!doctor) {
        console.log("Invalid user")
        return res.status(404).json({error: "Invalid user"})
    }
    //get the ward which is doctor belongs
    const ward = await Ward.findById(doctor["WardID"]);
    if(!ward) {
        console.log("No ward")
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

    const fromShiftOfSchedules = await ShiftOfASchedule.find({ date: fromDate, ward: ward });
    // console.log(fromShiftOfSchedules);
    if(fromShiftOfSchedules.length == 0){
        console.log("no shift Of Schedule")
        return res.status(404).json({error: "no shift Of Schedule"});
    }

    const toShiftOfSchedules = await ShiftOfASchedule.find({ date: toDate, ward: ward });
    // console.log(toShiftOfSchedules);
    if(toShiftOfSchedules.length == 0){
        console.log("no shift Of Schedule")
        return res.status(404).json({error: "no shift Of Schedule"});
    }

    
    const returnFromShiftofSchedules = []
    for (let i = 0; i < fromShiftOfSchedules.length; i++) {
        const shiftOfSchedule = fromShiftOfSchedules[i]
        // console.log(data,"pass5")
        if(shiftOfSchedule["doctors"].includes(id)){
            // console.log(data,"pass6")
            shiftDetails = await Shift.findById(shiftOfSchedule["shift"]);
            if(!shiftDetails) {
                console.log("Invalid shift")
                return res.status(400).json({error: "Invalid shift"})
                break;
            }
            const tempDoctors = []
            for (let j = 0; j < shiftOfSchedule["doctors"].length; j++) {
                // console.log(data,"pass7")
                doctorId = shiftOfSchedule["doctors"][j]
                if(id != doctorId){
                    tempDoctors.push({id: doctorId, name: alldoctors[doctorId]});
                }
            }
            // console.log(tempDoctors);
            returnFromShiftofSchedules.push({
                id : shiftOfSchedule["_id"],
                doctors : tempDoctors,
                shift: shiftDetails,
            })
        }
    }
    console.log(returnFromShiftofSchedules);
    if(returnFromShiftofSchedules.length == 0){
        console.log("no shift Of Schedule")
        return res.status(404).json({error: "no shift Of Schedule"})
    }
    // console.log("pass11");

    const returnToShiftofSchedules = []
    for (let i = 0; i < toShiftOfSchedules.length; i++) {
        const shiftOfSchedule = toShiftOfSchedules[i]
        // console.log(shiftOfSchedule);

        if(!shiftOfSchedule["doctors"].includes(id)){
            console.log("pass13");
            shiftDetails = await Shift.findById(shiftOfSchedule["shift"]);
            if(!shiftDetails) {
                console.log(shiftDetails," Invalid shift");
                return res.status(400).json({error: "Invalid shift"})
                break;
            }
            const tempDoctors = []
            for (let j = 0; j < shiftOfSchedule["doctors"].length; j++) {
                doctorId = shiftOfSchedule["doctors"][j]
                tempDoctors.push({id: doctorId, name: alldoctors[doctorId]});
            }
            // console.log(tempDoctors);
            returnToShiftofSchedules.push({
                id : shiftOfSchedule["_id"],
                doctors : tempDoctors,
                shift: shiftDetails,
            })
        }
    }
    // console.log("pass14");
    console.log(returnToShiftofSchedules);
    if(returnToShiftofSchedules.length == 0){
            console.log("no shift Of Schedule");
        return res.status(404).json({error: "no shift Of Schedule"})
    }

    console.log([returnFromShiftofSchedules,returnToShiftofSchedules], " done");
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
        console.log("Invalid user")
        return res.status(404).json({ error: "Invalid user" });
    }
    
    const doctor = await Doctor.findById({ _id: fromDoctor });
    if(!doctor) {
        console.log("Invalid user")
        return res.status(404).json({error: "Invalid user"})
    }
    const ward = doctor.WardID;
    // console.log("pass1")

    if (!mongoose.Types.ObjectId.isValid(fromShiftofSchedule)) {
        console.log("Invalid ShiftofSchedule" )
        return res.status(404).json({ error: "Invalid ShiftofSchedule" });
    }
    console.log("pass2")

    if (!mongoose.Types.ObjectId.isValid(toShiftofSchedule)) {
        console.log("Invalid ShiftofSchedule" )
        return res.status(404).json({ error: "Invalid ShiftofSchedule" });
    }
    console.log("pass3")

    if (!mongoose.Types.ObjectId.isValid(toDoctor)) {
        console.log("Invalid user")
        return res.status(404).json({ error: "Invalid user" });
    }
    // console.log("pass4")

    const SwappingShift ={
        fromDoctor: fromDoctor,
        fromShiftofSchedule: fromShiftofSchedule,
        toShiftofSchedule: toShiftofSchedule,
        toDoctor: toDoctor,
        ward: ward,
        status: 0,
    }

    
    try{
        const existingSwappingShift = await SwappingShifts.find({
            fromDoctor: fromDoctor,
            fromShiftofSchedule: fromShiftofSchedule,
            toShiftofSchedule: toShiftofSchedule,
            toDoctor: toDoctor,
            ward: ward,
        });
        // console.log(SwappingShift)

        if(existingSwappingShift.length == 0){
            const newSwappingShift = await SwappingShifts.create(SwappingShift);
            console.log(newSwappingShift, "done")
            res.status(200).json("Successfull");
        }else{
            console.log("swapping requiest is exists")
            res.status(400).json({error: "swapping requiest is exists"});
        }

    } catch (error) {
        console.log(error.massage)
        return res.status(400).json({error: error.message})
    }
}


const getRequests = async (req, res) => {
    const id = req.body.id;
    // const id = new mongoose.Types.ObjectId("633ab54a9fd528b9532b8d59");
    // const id = "633ab0f123be88c950fb8a89";
    const fromRequests = [];
    const toRequests = [];

    console.log(id)
    console.log("data recieved");

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid user");
        return res.status(404).json({ error: "Invalid user" });
    }
    const doctor = await Doctor.findById({ _id: id });
    if(!doctor) {
        console.log("Invalid user");
        return res.status(404).json({error: "Invalid user"})
    }
    const  ward = doctor.WardID
    // console.log({ toDoctor: id, ward:ward } )
    //get the other doctors requests
    const forSwappingShifts = await SwappingShifts.find({ toDoctor: id, ward:ward });
// console.log(forSwappingShifts)
    for (let i = 0; i < forSwappingShifts.length; i++) {
        const forSwappingShift = forSwappingShifts[i];

        const fromDoctor = await Doctor.findById({ _id: forSwappingShift.fromDoctor });
        if(!fromDoctor) {
            console.log("Invalid user");
            return res.status(404).json({error: "Invalid user"})
        }

        const toShiftofSchedule = await ShiftOfASchedule.findById({ _id: forSwappingShift.fromShiftofSchedule });
        if(!toShiftofSchedule) {
            console.log("Invalid ShiftofSchedule");
            return res.status(404).json({error: "Invalid ShiftofSchedule"})
        }

        const toShift = await Shift.findById({ _id: toShiftofSchedule.shift });
        if(!toShift) {
            console.log("Invalid Shift");
            return res.status(404).json({error: "Invalid Shift"})
        }
        const fromShiftofSchedule = await ShiftOfASchedule.findById({ _id: forSwappingShift.toShiftofSchedule });
        if(!fromShiftofSchedule) {
            console.log("Invalid ShiftofSchedule");
            return res.status(404).json({error: "Invalid ShiftofSchedule"})
        }

        const fromShift = await Shift.findById({ _id: fromShiftofSchedule.shift });
        if(!fromShift) {
            console.log("Invalid Shift");
            return res.status(404).json({error: "Invalid Shift"})
        }
    
        const SwappingShift = {
            id: forSwappingShift._id,
            name: fromDoctor.name,
            fromDate: fromShiftofSchedule.date,
            fromShiftName: fromShift.name,
            fromShift: fromShift.startTime.concat(' - ', fromShift.endTime),
            toDate: toShiftofSchedule.date,
            toShiftName: toShift.name,
            toShift: toShift.startTime.concat(' - ', toShift.endTime),
            status: forSwappingShift.status
        }

        fromRequests.push(SwappingShift)
    }
    // console.log(fromRequests)
    //get the request of corresponding doctor
    const toSwappingShifts = await SwappingShifts.find({ fromDoctor: id, ward:ward });

    for (let i = 0; i < toSwappingShifts.length; i++) {
        const toSwappingShift = toSwappingShifts[i];
        // console.log(toSwappingShift)
        const toDoctor = await Doctor.findById({ _id: toSwappingShift.toDoctor });
        if(!toDoctor) {
            console.log("Invalid user")
            return res.status(404).json({error: "Invalid user"})
        }
        // console.log(toSwappingShift.toShiftofSchedule)

        const fromShiftofSchedule = await ShiftOfASchedule.findById({ _id: toSwappingShift.fromShiftofSchedule });
        if(!fromShiftofSchedule) {
            console.log("Invalid ShiftofSchedule")
            return res.status(404).json({error: "Invalid ShiftofSchedule"})
        }
        console.log(fromShiftofSchedule)

        const fromShift = await Shift.findById({ _id: fromShiftofSchedule.shift });
        if(!fromShift) {
            console.log("Invalid Shift")
            return res.status(404).json({error: "Invalid Shift"})
        }
        
        const toShiftofSchedule = await ShiftOfASchedule.findById({ _id: toSwappingShift.toShiftofSchedule });
        if(!toShiftofSchedule) {
            console.log("Invalid ShiftofSchedule")
            return res.status(404).json({error: "Invalid ShiftofSchedule"})
        }

        const toShift = await Shift.findById({ _id: toShiftofSchedule.shift });
        if(!toShift) {
            console.log("Invalid Shift")
            return res.status(404).json({error: "Invalid Shift"})
        }
    
        const SwappingShift = {
            name: toDoctor.name,
            fromDate: fromShiftofSchedule.date,
            fromShiftName: fromShift.name,
            fromShift: fromShift.startTime.concat(' - ', fromShift.endTime),
            toDate: toShiftofSchedule.date,
            toShiftName: toShift.name,
            toShift: toShift.startTime.concat(' - ', toShift.endTime),
            status: toSwappingShift.status
        }

        toRequests.push(SwappingShift)
    }

    console.log([fromRequests,toRequests], " done");
    res.status(200).json([fromRequests,toRequests]);

}

const setRequestResponse = async (req, res) => {

    const data = req.body;
    const requestId = data.requestId;
    const agree = data.Agree;
    console.log(data)
    console.log("data recieved");

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        console.log("Invalid Swappingshift");
        return res.status(404).json({ error: "Invalid Swappingshift" });
    }
    //get the Swappingshift details according to the id
    const SwappingShift = await SwappingShifts.findById({ _id: requestId });
    if(!SwappingShift) {
        console.log("Invalid Swappingshift");
        return res.status(404).json({error: "Invalid Swappingshift"})
    } 
    const updateFields = {}
    if (agree){
        updateFields["status"]= 2;
    }else{
        updateFields["status"]= 1;
    }
    // console.log(updateFields)
    try {
        const newSwappingShift = await SwappingShifts.findOneAndUpdate( { _id: requestId }, updateFields);
        if (!newSwappingShift) {
            console.log("No such swapping shift")
            return res.status(404).json({ error: "No such swapping shift" });
        }
        console.log(newSwappingShift," done")
        return res.status(200).json(newSwappingShift)
    } catch (error) {
        console.log(error.massage)
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
    getRequests,
    setRequestResponse,
};
