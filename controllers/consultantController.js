const request = require('request');
const axios = require('axios');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require("../models/shiftModel");
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel");
const mongoose = require('mongoose')
const Schedule = require('../models/scheduleModel')
const consultantRequirement = require('../models/consultantRequirement');
const Requirement = require("../models/requirementModel");
const Leave = require("../models/leaveModel")
const ShiftOfASchedule = require("../models/shiftOfAScheduleModel")

const createSchedule = async (req, res) => {
  const data = req.body;
  const wardId = '6339cfeed189aaa0727ebbf1' // ward Id
  


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
              date: date
            }
          )


        }
      }
      
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
  const wardId = '6339cfeed189aaa0727ebbf1'
  
  if (!mongoose.Types.ObjectId.isValid(wardId)) {
    return res.status(404).json({error: "No such ward"})
  }
  
  const ward = await Ward.findById(wardId);
  

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