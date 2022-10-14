const request = require('request');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require("../models/shiftModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const mongoose = require('mongoose')
const Schedule = require('../models/scheduleModel')
const consultantRequirement = require('../models/consultantRequirement');

const createSchedule = async (req, res) => {
  const data = req.body;
  const wardId = '6339cfeed189aaa0727ebbf1'
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
  // console.log(ward)

  if(!ward) {
      return res.status(404).json({error: "No such ward"})
  }

  const scheduleID = ward.currentScheduleID;

  const schedule = await Schedule.findById(scheduleID);

  if(!schedule) {
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

      if(scheduleUpdated) {
        return res.status(201).json({msg: "success"})
      }
    }
  } catch(error) {
    return res.status(400).json({error: error.message})
  }
  

    // request('http://127.0.0.1:5000/schedule', function (error, response, body) {
    //     console.error('error:', error); // Print the error
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     console.log('body:', body); // Print the data received
    //     res.send(body); //Display the response on the website
    //   }); 
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

//get the calendar detais according to user preferences
const viewCalendar = async (req, res) => {
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

module.exports = {
  setDeadline,
  createSchedule,
  getDoctors,
  getDoctorCategories,
  viewCalendar,
}