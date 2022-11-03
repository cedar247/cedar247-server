const request = require('request');
const axios = require('axios');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const mongoose = require('mongoose')
const Schedule = require('../models/scheduleModel')
const consultantRequirement = require('../models/consultantRequirement');
const Requirement = require("../models/requirementModel");
const Leave = require("../models/leaveModel")

const createSchedule = async (req, res) => {
  const data = req.body;
  const wardId = '6339cfeed189aaa0727ebbf1' // ward Id
  // console.log(data)

  const categoriesBinding = {
    'Senior Registrar': 'seniorRegistrar',
    'Registrar': 'registrar',
    'Senior Home Officer': 'seniorHomeOfficer',
    'Home Officer': 'homeOfficer',
    "Medical Officer": 'medicalOfficer'
  }

  if (!mongoose.Types.ObjectId.isValid(wardId)) {
    return res.status(404).json({error: "No such ward"})
  }

  const ward = await Ward.findById(wardId);

  if(!ward) {
      return res.status(404).json({error: "No such ward"})
  }

  const scheduleID = ward.currentScheduleID; // get current schedule Id of the ward

  const schedule = await Schedule.findById(scheduleID);

  if(!schedule) { // check whether the schedule is exists in the database
    return res.status(404).json({error: "No such schedule"})
  }

  try{
    const requirementIds = [];
    for(let i = 0; i < data.length; i++) {
      const requirementDetails = data[i];

      const reqAddingDetails = {
        shiftId: requirementDetails["shiftId"]
      }

      for(const [key, value] of Object.entries(requirementDetails)) {
        if(key != "shiftId") {
          reqAddingDetails[categoriesBinding[key]] = value
        }
      }

      const requirement = await consultantRequirement.create(reqAddingDetails)
      const requirementId = requirement._id;
      requirementIds.push(requirementId)
    }

    if(!schedule.consultantRequirements) {
      const scheduleUpdated = await Schedule.findOneAndUpdate(
        {_id: scheduleID},
        {$set: {
          consultantRequirements: requirementIds
        }}
      )

      if(scheduleUpdated) {
        return res.status(201).json({msg: "success"})
      }
    } else {
      const scheduleUpdated = await Schedule.findOneAndUpdate(
        {_id: scheduleID},
        {
          consultantRequirements: requirementIds
        }
      )

      // doctors' ids
      const doctorsIds = ward.doctors
      const doctorCategories = ward.doctorCategories

      // create an object for doctors' details
      const doctors_details = {}

      // initialize empty arrays for each doctor category
      for(let i = 0; i < doctorCategories.length; i++) {
        doctors_details[doctorCategories[i]] = []
      }

      // iterate through doctors list and get details of each doctor
      for(let i = 0; i < doctorsIds.length; i++) {
        const doctor = await Doctor.findById(doctorsIds[i])

        const category = doctor.category // category of the doctor

        // check whether doctor's category is correct
        if(doctorCategories.includes(category)) {
          const requirements = await Requirement.find({doctor: doctorsIds[i]})
          const leaves = requirements.leaves; // leaves by doctor

          for(let i = 0; i < leaves.length; i++) {
            const leaveId = leaves[i] // leave id

            const leave = await Leave.findById(leaveId) // leave

            //Todo: add a condition to get only leave related the scheduling month

            const shifts = leave.shift // shifts of that given 
          }
        } else {
          return res.status(404).json({error: "No such category"})
        }
      }

      // send schedule data to flask server
      const data = {
        name: 'John Doe',
        job: 'Content Writer'
      }
      
      
      const response = await axios.post('http://localhost:5000/schedule', data)
      console.log(`Status: ${res.status}`)
      console.log('Body: ', res.data)
      
      // createUser()

      

      // if(scheduleUpdated) {
      //   return res.status(201).json({msg: "success"})
      // }
    }
    

  } catch(error) {
    return res.status(400).json({error: error.message})
  }
  

}

const setDeadline = async (req, res) => {
  const data = req.body
  const year = data.year;
  const month = data.month;
  const deadline = data.deadline;
  const wardId = '6339cfeed189aaa0727ebbf1'
  
  if (!mongoose.Types.ObjectId.isValid(wardId)) {
    return res.status(404).json({error: "No such ward"})
  }
  
  const ward = await Ward.findById(wardId);
  // console.log(ward)

  if(!ward) {
      return res.status(404).json({error: "No such ward"})
  }

  try {
    const schedule = await Schedule.create({
      year: year,
      month: month,
      deadline: deadline,
      ward: wardId,
      status: 0
    });

    const scheduleId = schedule._id;
    console.log(scheduleId)
    
    if(!ward.currentScheduleID) {
      const wardUpdated = await Ward.findOneAndUpdate({_id: wardId}, {$set: {
        currentScheduleID: scheduleId
      }});
    }
    else {
      const wardUpdated = await Ward.findOneAndUpdate({_id: wardId}, {
        currentScheduleID: scheduleId
      });
    }
    

    if (!ward) {
      return res.status(404).json({error: "No such ward"})
    }

    return res.status(201).json({msg: "success"})
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

const getDoctors = async (req, res) => {
  const filter = {}; // filter must be {ward:_id} id must be given
  const doctors = await Doctor.find(filter);
  const newDoctors = [];


  for(let i = 0; i < doctors.length; i++) {
    const ward = await Ward.findById(doctors[i]["WardID"]);
    
      doctors[i]["wardName"] = ward.name;
      doctors[i]["wardNumber"] = ward.number;
      newDoctors.push(
        {
          _id: doctors[i]["_id"],
          name: doctors[i]["name"],
          phoneNumber: doctors[i]["phoneNumber"],
          email: doctors[i]["email"],
          category: doctors[i]["category"],
          WardID: doctors[i]["WardID"],
          "wardName": ward.name,
          "wardNumber": ward.number
        }
      )
  }

  res.status(200).json(newDoctors);
}

const getDoctorCategories = async (req, res) => {
  const wardId = '6339cfeed189aaa0727ebbf1';

  if (!mongoose.Types.ObjectId.isValid(wardId)) {
    return res.status(404).json({error: "No such ward"})
  }

  const ward = await Ward.findById(wardId)

  if(!ward) {
      return res.status(404).json({error: "No such ward"})
  }

  const doctorCategories = ward.doctorCategories;

  return res.status(200).json(doctorCategories);
}

module.exports = {
  setDeadline,
  createSchedule,
  getDoctors,
  getDoctorCategories
}