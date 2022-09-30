const request = require('request');
const User = require('../models/userModel')
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
    // const _id ='6334249bebcfbf785191df1d';
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

    const {id,allawAllDoctors} = req.body;
    const appointments = [];
    const owners = [];
    const colors = ['#7E57C2', '#FF7043', '#E91E63', '#E91E63', '#AB47BC', '#FFA726'];
    
    console.log("data recieved");
    const data = req.body;
    console.log(data);

    // const _id ='6334249bebcfbf785191df1d';
    const doctor = await Doctor.findById({_id: id});
    const ward = await Ward.findById(doctor["WardID"]);
    const Schedules = await Schedule.find(doctor["WardID"]);

    const allshifts = {}
    for(let i = 0; i < ward["shifts"].length; i++) {

        shiftDetails = await Shift.findById(ward["shifts"][i]);
        allshifts[ward["shifts"][i]] = shiftDetails;
    }
    // console.log(allshifts);

    const alldoctors = {}
    for(let i = 0; i < ward["doctors"].length; i++) {

        doctorDetails = await Doctor.findById(ward["doctors"][i]);
        alldoctors[ward["doctors"][i]] = owners.length+1;
        owners.push({
            text: doctorDetails["name"],
            id: i,
            color: colors[i%6]
        })
    }
    console.log(owners);
    // console.log(alldoctors);

    // console.log(Schedules);
    for(let i = 0; i < Schedules.length; i++) {

    const shiftOfSchedules = [];
    // console.log(Schedules[i]["data"]);
    
        for(let j = 0; j < Schedules[i]["data"].length; j++) {
            // console.log(Schedules[i]["data"][j]);

            const shiftOfSchedule = await ShiftOfASchedule.findById(Schedules[i]["data"][j]);
            // console.log(shiftOfSchedule);

            const shiftInSchedule = allshifts[shiftOfSchedule["shift"]];

            const doctorsInShift = [];
            // console.log(Number(date[0]))

            for(let k = 0; k < shiftOfSchedule["doctors"].length; k++) {
                // console.log(shiftOfSchedule["doctors"][k]);

                doctorsInShift.push(alldoctors[shiftOfSchedule["doctors"][k]]);
                // console.log(doctorInSchedule);

            }
            
            appointments.push(
                {
                    title : shiftInSchedule["name"],
                    date: shiftOfSchedule["date"],
                    startTime: shiftInSchedule["startTime"],
                    endTime: shiftInSchedule["endTime"],
                    id: appointments.length,
                    doctors: doctorsInShift
                } 
            );

        }

        console.log(appointments);
    }

    const resourcesData = [ {
        fieldName: 'doctors',
        title: 'Doctor',
        instances: owners,
        }]

    console.log("done");
    res.status(200).json([appointments, resourcesData]);
};

const changePassword = async (req, res) => {

    console.log("data recieved");
    const data = req.body;
    // const _id ='6334249bebcfbf785191df1d';
    const updateFields = {
        email: data["email"],
        password:data["password"]
    }
    console.log(updateFields)

    const doctor = await Doctor.findById({_id:data["id"]});
    console.log(doctor)


    const updateDoctor = await User.findOneAndUpdate({_id: doctor["userId"]}, updateFields)
    console.log(updateDoctor)

    if (!updateDoctor) {
                return res.status(404).json({error: 'No such workout'})
            }
            res.status(200).json(updateDoctor)

    console.log(data);
};

module.exports = {
    defineRequirements,
    changeClendar,
    changePassword,
};
