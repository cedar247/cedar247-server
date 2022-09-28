const request = require('request');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Leave = require('../models/leaveModel')
const Shift = require('../models/shiftModel')
const Requirement = require('../models/requirementModel')
const ShiftOfASchedule = require('../models/shiftOfAScheduleModel')
const Schedule = require('../models/scheduleModel')

const defineRequirements = async (req, res) => {
    console.log("data recieved");
    const data = req.body;
    console.log(data);

    const {id,date,morning,evening,night} = req.body
    // const _id ='6333455ab7cee2b016919f60';
    const doctor = await Doctor.findById({_id: id});
    const ward = await Ward.findById(doctor["WardID"]);

    const shifts = ward["shifts"];

    const leavedshifts = [];
    for(let i = 0; i < shifts.length; i++) {

        shiftDetails = await Shift.findById(shifts[i]);

        if(morning && shiftDetails["name"] == "morning" ){
            leavedshifts.push(shiftDetails["_id"].toString());

        }if(evening && shiftDetails["name"] == "evening" ){
            leavedshifts.push(shiftDetails["_id"].toString());

        }if(night && shiftDetails["name"] == "night" ){
            leavedshifts.push(shiftDetails["_id"].toString());
        }
    }

    const leave = {
        date: date,
        shift: leavedshifts,
    }

    const newleave = await Leave.create(leave);

    const requiredLeaves = [];
    requiredLeaves.push(newleave["_id"].toString());

    const requirement = {
        doctor: id,
        leaves: requiredLeaves,
    }

    const newRequirement = await Requirement.create(requirement);
    
    res.status(200).json(newRequirement);
};


const changeClendar = async (req, res) => {
    console.log("data recieved");
    const data = req.body;

    console.log(data);
    res.status(200).json([]);
};

const changePassword = async (req, res) => {
    console.log("data recieved");
    const data = req.body;

    console.log(data);
};

module.exports = {
    defineRequirements,
    changeClendar,
    changePassword,
};
