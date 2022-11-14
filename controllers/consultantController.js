const request = require('request');
const axios = require('axios');
const Consultant = require('../models/consultantModel');
const User = require("../models/userModel");
const Doctor = require('../models/doctorModel');
const Ward = require('../models/wardModel');
const Shift = require("../models/shiftModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const mongoose = require('mongoose')
const Schedule = require('../models/scheduleModel')
const consultantRequirement = require('../models/consultantRequirement');
const Requirement = require("../models/requirementModel");
const Leave = require("../models/leaveModel")
const SwappingShifts = require("../models/swappingShiftModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
require('dotenv').config()

const createSchedule = async (req, res) => {
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

    if(!user || user.type !== "CONSULTANT") {
        return res.status(401).json({ error: "Unauthorized access"})
    }

    const consultantId = user._id;

    if(!mongoose.Types.ObjectId.isValid(consultantId)) {
      return res.status(404).json({error: "No such consultant"})
    }

    const consultant = await Consultant.findById(consultantId) // get the details of the consultant

    if(!consultant) { // no such consultant
      return res.status(404).json({error: "No such consultant"})
    }

    if(!consultant.WardID) {
        return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
    }

    const wardId = consultant.WardID; // get the ward id from token

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

      // if(scheduleUpdated) {
      //   return res.status(201).json({msg: "success"})
      // }
    } else {
      const scheduleUpdated = await Schedule.findOneAndUpdate(
        {_id: scheduleID},
        {
          consultantRequirements: requirementIds
        }
      )

      // doctors' ids
      const doctorsIds = ward.doctors
      const doctorCategories = ward.doctorCategories // doctor categories in given ward
      const shift_types = ward.shifts // shift types in the ward
      const consecutive_groups = ward.constraints.consecutiveGroups // consecutive groups of shifts
      const specialShifts = ward.constraints.specialShifts // special shifts
      const num_doctors_per_shift = req.body // number of doctors per each shift

      // year and month corresponding to the schedule
      const year = scheduleUpdated.year
      const month = scheduleUpdated.month

      
      const doctors_details = {} // create an object for doctors' details
      const consecutive_shifts = {} // consecutive shifts
      const special_shifts = {} // special shifts with corresponding vacation
      const num_doctors = {} // number of doctors per each doctor type

      // create a dictionary for consecutive shifts
      for(let i = 0; i < consecutive_groups.length; i++) {
        const consecutive_group = consecutive_groups[i]
        
        for(let j = 0; j < consecutive_group.length - 1; j++) {
          consecutive_shifts[consecutive_group[j]] = consecutive_group[j+1]
        }
      }

      console.log(consecutive_shifts)

      // create a dictionary for special shifts
      for(let i = 0; i < specialShifts.length; i++) {
        const special_shift = specialShifts[i]
        special_shifts[special_shift["shift"]] = special_shift["vacation"]
      }

      
      // initialize empty arrays for each doctor category
      for(let i = 0; i < doctorCategories.length; i++) {
        doctors_details[doctorCategories[i]] = []
        num_doctors[doctorCategories[i]] = {} // initialize num_doctors
      }

      // create an object for each doctor type
      for(let i = 0; i < num_doctors_per_shift.length; i++) {
        const doctor_stat = num_doctors_per_shift[i] // details of one shift
        const shift_id = doctor_stat.shiftId

        for(let i = 0; i < doctorCategories.length; i++) {
          num_doctors[doctorCategories[i]][shift_id] = parseInt(doctor_stat[doctorCategories[i]])
        }
      }


      // iterate through doctors list and get details of each doctor
      for(let i = 0; i < doctorsIds.length; i++) {
        const doctor = await Doctor.findById(doctorsIds[i])
        const doctor_details = [doctorsIds[i]] // array to store doctor id and leaves
        
        const category = doctor.category // category of the doctor

        // check whether doctor's category is correct
        if(doctorCategories.includes(category)) {
          const requirements = await Requirement.find({doctor: doctorsIds[i]})
          const leaves = requirements.leaves; // leaves by doctor

          const leave_details = []

          if(leaves){
            for(let j = 0; j < leaves.length; j++) {
              const leaveId = leaves[j] // leave id
  
              const leave = await Leave.findById(leaveId) // leave
  
              //Todo: add a condition to get only leaves related the scheduling month
  
              const shifts = leave.shift // shifts of that given 
              const date = leave.date // date of a leave
  
              leave_details.push(date) // add date to leave details : (date must be string)
  
              // add all shifts corresponding to the leave
              for(let k = 0; k < shifts.length; k++) {
                leave_details.push(shifts[k]) 
              }
            }
          }
          

          doctor_details.push(leave_details) // add leave details to doctor_details

          doctors_details[category].push(doctor_details) // add doctor details to respective category
        } 
        // else {
        //   return res.status(404).json({error: "No such category"})
        // }
      }

      // send schedule data to flask server
      const data = {
        doctors_details: doctors_details,
        shift_types: shift_types,
        consecutive_shifts: consecutive_shifts,
        special_shifts: special_shifts,
        num_doctors: num_doctors,
        doctorCategories: doctorCategories,
        year: year,
        month: month
      }
      

      const response = await axios.post('http://localhost:5000/schedule', data)
      const rosters = response.data
      const numDays = new Date(year, month, 0).getDate()
      console.log(numDays)
      const shift_data = []

      for(let i = 0; i < numDays; i++) { // iterate all number of days
        for(let j = 0; j < shift_types.length; j++) { // iterate through shifts
          
          const date = rosters[0][i][0]
          const shift = shift_types[j]
          const doctors_all = [] // doctors of all categories
          
          for(let k = 0; k < doctorCategories.length; k++) {
            const doctors = rosters[k][i][j+1]

            if(doctors != -1) { // check whether there are doctors assigned
              for(let l = 0; l < doctors.length; l++) {
                doctors_all.push(doctors[l])
              }
            }
          }

          // add shiftOfASchedule to database
          const shiftOfASchedule = await ShiftOfASchedule.create(
            {
              doctors: doctors_all,
              shift: shift,
              date: date,
              ward: wardId
            }
          )

          // add id of shiftOfASchedule to data array
          shift_data.push(shiftOfASchedule._id)
        }
      }

      const schedule = await Schedule.findOneAndUpdate(
        {_id: scheduleID},
        {
          data: shift_data
        }
      )
      return res.status(201).json({msg: "schedule successfully created!!!"})
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
  const bearerHeader = req.header('Authorization'); // header
  
  try {
    // decode the jwt token
    if(!bearerHeader) {
      return res.status(401).json({ error: "Unauthorized access"})
    }

    const bearer = bearerHeader.split(' ');
    const token = bearer[1]
    const user = jwt.verify(token, process.env.SECRET);

    if(!user || user.type !== "CONSULTANT") {
        return res.status(401).json({ error: "Unauthorized access"})
    }

    const consultantId = user._id;

    if(!mongoose.Types.ObjectId.isValid(consultantId)) {
      return res.status(404).json({error: "No such consultant"})
    }

    const consultant = await Consultant.findById(consultantId) // get the details of the consultant

    if(!consultant) { // no such consultant
      return res.status(404).json({error: "No such consultant"})
    }

    if(!consultant.WardID) {
        return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
    }

    const wardId = consultant.WardID; // get the ward id from token

    if (!mongoose.Types.ObjectId.isValid(wardId)) {
      return res.status(404).json({error: "No such ward"})
    }
    
    const ward = await Ward.findById(wardId);
    
    if(!ward) {
        return res.status(404).json({error: "No such ward"})
    }

    const schedule = await Schedule.create({
      year: year,
      month: month,
      deadline: deadline,
      ward: wardId,
      status: 0
    });

    const scheduleId = schedule._id;
    
    
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
  const bearerHeader = req.header('Authorization'); // header

  try {
    // decode the jwt token
    if(!bearerHeader) {
      return res.status(401).json({ error: "Unauthorized access"})
    }

    const bearer = bearerHeader.split(' ');
    const token = bearer[1]
    const user = jwt.verify(token, process.env.SECRET);

    if(!user || user.type !== "CONSULTANT") {
        return res.status(401).json({ error: "Unauthorized access"})
    }

    const consultantId = user._id;

    if(!mongoose.Types.ObjectId.isValid(consultantId)) {
      return res.status(404).json({error: "No such consultant"})
    }

    const consultant = await Consultant.findById(consultantId) // get the details of the consultant

    if(!consultant) { // no such consultant
      return res.status(404).json({error: "No such consultant"})
    }

    if(!consultant.WardID) {
        return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
    }

    const wardId = consultant.WardID; // get the ward id from token

    if (!mongoose.Types.ObjectId.isValid(wardId)) {
      return res.status(404).json({error: "No such ward"})
    }

    const filter = {WardID: wardId}; // filter must be {ward:_id} id must be given
    const doctors = await Doctor.find(filter);
    const newDoctors = [];
    const ward = await Ward.findById(wardId);

    if(!ward) { // no such ward
      return res.status(404).json({error: "No such ward"})
    }

    for(let i = 0; i < doctors.length; i++) {
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
    
  
    return res.status(200).json(newDoctors);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

const getDoctorCategories = async (req, res) => {
  const bearerHeader = req.header('Authorization'); // header

  try {
    if(!bearerHeader) {
      return res.status(401).json({ error: "Unauthorized access"})
    }

    const bearer = bearerHeader.split(' ');
    const token = bearer[1]
    const user = jwt.verify(token, process.env.SECRET);

    if(!user || user.type !== "CONSULTANT") {
        return res.status(401).json({ error: "Unauthorized access"})
    }

    const consultantId = user._id;

    if(!mongoose.Types.ObjectId.isValid(consultantId)) {
      return res.status(404).json({error: "No such consultant"})
    }

    const consultant = await Consultant.findById(consultantId) // get the details of the consultant

    if(!consultant) { // no such consultant
      return res.status(404).json({error: "No such consultant"})
    }

    if(!consultant.WardID) {
        return res.status(401).json({ error: "Unauthorized access"}) // check if status 401 is matching with the error
    }

    const wardId = consultant.WardID; // get the ward id from token
  
    if (!mongoose.Types.ObjectId.isValid(wardId)) {
      return res.status(404).json({error: "No such ward"})
    }

    const ward = await Ward.findById(wardId)

    if(!ward) {
        return res.status(404).json({error: "No such ward"})
    }

    const doctorCategories = ward.doctorCategories;

    return res.status(200).json(doctorCategories);
  } catch (error) {
    return res.status(400).json({error: error.message})
  }
}

const getRequests = async (req, res) => {
  const data = req.body
  const id = data.id;
  // const id = "633aabe28cad2f59865cb5de";
  const Requests = [];
  const acceptededRequests = [];
  const rejectedRequests = [];

  console.log(id)
  console.log("data recieved");

  // const _id ='633ab0f123be88c950fb8a89';

  if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(data,"pass1")
      return res.status(404).json({ error: "Invalid user" });
  }
  const consultant = await Consultant.findById({ _id: id });
  if(!consultant) {
      console.log(data,"pass2")
      return res.status(404).json({error: "Invalid user"})
  }
  const ward = consultant.WardID
  //get the other doctors requests
  const forSwappingShifts = await SwappingShifts.find({status: [2,3,4], Ward: ward});

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

  const updateConsultantFileds = {
    email: data["email"],
};

  console.log(updateFields);
  //get the ward which is doctor belongs
  const consultant = await Consultant.findById({ _id: data["id"] });
  if(!consultant) {
      return res.status(404).json({error: "Invalid user"})
  }
  console.log(consultant);
  try {
      const updateConsultant = await Consultant.findOneAndUpdate(
        { _id: consultant._id },
        updateConsultantFileds
      );
      if (!updateConsultant) {
        return res.status(404).json({ error: "No such consultant" });
      }
      //find and update the doctos email and the password
      const updateUser = await User.findOneAndUpdate(
          { _id: consultant["userId"] },
          updateFields
      );
      console.log(updateUser,"yes");

      if (!updateUser) {
          return res.status(404).json({ error: "No such workout" });
      }
      res.status(200).json(updateUser);
  } catch (error) {
      return res.status(400).json({error: error.message})
  }
};

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
  const consultant = await Consultant.findById({ _id: id });
  // if(!doctor) {
  //     return res.status(404).json({error: "Invalid user"})
  // }
  //get the ward which is doctor belongs
  const ward = await Ward.findById(Consultant["WardID"]);
  if(!ward) {
      return res.status(404).json({error: "No ward"})
  }
  //find schedules which is belong to the ward that we selected
  const Schedules = await Schedule.find(consultant["WardID"]);
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
  getRequests,
  setRequestResponse,
  changePassword,
  viewCalendar,
}