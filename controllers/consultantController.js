const request = require('request');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const mongoose = require('mongoose')
const Schedule = require('../models/scheduleModel')
const consultantRequirement = require('../models/consultantRequirement');
const SwappingShifts = require("../models/swappingShiftModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const Shift = require("../models/shiftModel");

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

const getRequests = async (req, res) => {
  // const id = req.body.id;
  // const id = "633ab54a9fd528b9532b8d59";
  const id = "633ab0f123be88c950fb8a89";
  const Requests = [];
  const acceptededRequests = [];
  const rejectedRequests = [];

  console.log(id)
  console.log("data recieved");

  // const _id ='633ab0f123be88c950fb8a89';

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //     console.log(data,"pass1")
  //     return res.status(404).json({ error: "Invalid user" });
  // }

  //get the other doctors requests
  const forSwappingShifts = await SwappingShifts.find({status: [2,3,4]});

  for (let i = 0; i < forSwappingShifts.length; i++) {
      const forSwappingShift = forSwappingShifts[i];

      const fromDoctor = await Doctor.findById({ _id: forSwappingShift.fromDoctor });
      if(!fromDoctor) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid user"})
      }
      const toDoctor = await Doctor.findById({ _id: forSwappingShift.toDoctor });
      if(!fromDoctor) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid user"})
      }

      const toShiftofSchedule = await ShiftOfASchedule.findById({ _id: forSwappingShift.toShiftofSchedule });
      if(!toShiftofSchedule) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid ShiftofSchedule"})
      }

      const toShift = await Shift.findById({ _id: toShiftofSchedule.shift });
      if(!toShift) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid Shift"})
      }
      const fromShiftofSchedule = await ShiftOfASchedule.findById({ _id: forSwappingShift.fromShiftofSchedule });
      if(!fromShiftofSchedule) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid ShiftofSchedule"})
      }

      const fromShift = await Shift.findById({ _id: fromShiftofSchedule.shift });
      if(!fromShift) {
          console.log(data,"pass2")
          return res.status(404).json({error: "Invalid Shift"})
      }
  
      const SwappingShift = {
          id: forSwappingShift._id,
          fromName: fromDoctor.name,
          toName: toDoctor.name,
          fromDate: fromShiftofSchedule.date,
          fromShiftName: fromShift.name,
          fromShift: fromShift.startTime.concat(' - ', fromShift.endTime),
          toDate: toShiftofSchedule.date,
          toShiftName: toShift.name,
          toShift: toShift.startTime.concat(' - ', toShift.endTime),
          status: forSwappingShift.status
      }

      if(forSwappingShift.status == 2){
        Requests.push(SwappingShift)
      }else if(forSwappingShift.status == 3){
        rejectedRequests.push(SwappingShift)
      }else{
        acceptededRequests.push(SwappingShift)
      }

  }
  res.status(200).json([Requests,acceptededRequests,rejectedRequests]);

}

const setRequestResponse = async (req, res) => {

  const data = req.body;
  const requestId = data.requestId;
  const agree = data.Agree;
  console.log(data)
  console.log("data recieved");

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(404).json({ error: "Invalid Swappingshift" });
  }
  //get the Swappingshift details according to the id
  const SwappingShift = await SwappingShifts.findById({ _id: requestId });
  if(!SwappingShift) {
      return res.status(404).json({error: "Invalid Swappingshift"})
  } 
  const updateFields = {}
  if (agree){
      updateFields["status"]= 4;
  }else{
      updateFields["status"]= 3;
  }
  console.log(updateFields)
  try {
      const newSwappingShift = await SwappingShifts.findOneAndUpdate( { _id: requestId }, updateFields);
      if (!newSwappingShift) {
          return res.status(404).json({ error: "No such swapping shift" });
      }
      return res.status(200).json(newSwappingShift)
  } catch (error) {
      return res.status(400).json({error: error.message})
  }
}

module.exports = {
  setDeadline,
  createSchedule,
  getDoctors,
  getDoctorCategories,
  getRequests,
  setRequestResponse,
}