const request = require("request");
const mongoose = require('mongoose');
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Ward = require("../models/wardModel");
const Leave = require("../models/leaveModel");
const Shift = require("../models/shiftModel");
const Requirement = require("../models/requirementModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const Schedule = require("../models/scheduleModel");
const bcrypt = require('bcrypt');

//defined the user requirements 
const defineRequirements = async (req, res) => {
    console.log("data recieved");
    const data = req.body;
    console.log(data);

    const { id, date, morning, evening, night } = req.body;
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

    const shifts = ward["shifts"];

    const leavedshifts = [];
    //map the data from front end with the leaves schema
    for (let i = 0; i < shifts.length; i++) {
        shiftDetails = await Shift.findById(shifts[i]);
        if(!shiftDetails) {
            return res.status(400).json({error: "Invalid shift"})
            break;
        }

        if (morning && shiftDetails["name"] == "morning") {
            leavedshifts.push(shiftDetails["_id"].toString());
        }
        if (evening && shiftDetails["name"] == "evening") {
            leavedshifts.push(shiftDetails["_id"].toString());
        }
        if (night && shiftDetails["name"] == "night") {
            leavedshifts.push(shiftDetails["_id"].toString());
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

module.exports = {
    defineRequirements,
    changeClendar,
    changePassword,
    getShifts,
};
