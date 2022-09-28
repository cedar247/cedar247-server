const Workout = require('../models/workoutModel')
const Ward = require('../models/wardModel')
const Leave = require('../models/leaveModel')
const Shift = require('../models/shiftModel')
const Requirement = require('../models/requirementModel')
const ShiftOfASchedule = require('../models/shiftOfAScheduleModel')
const Schedule = require('../models/scheduleModel')
const mongoose = require('mongoose')
// // get all workouts
// const getWorkouts = async (req, res) => {
//     const workouts = await Workout.find({}).sort({createdAt: -1})

//     res.status(200).json(workouts)
// }


// // get a single workout
// const getWorkout = async (req, res) => {
//     const { id } = req.params

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     const workout = await Workout.findById(id)

//     if (!workout) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     res.status(200).json(workout)
// }

// // create new workout
// const createWorkout = async (req, res) => {
//     const {title, load, reps} = req.body

//     // add doc to database
//     try {
//         const workout = await Workout.create({title, load, reps})
//         res.status(200).json(workout)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
//     // res.json({msg: 'POST a new workout'})
// }

// // delete a workout
// const deleteWorkout = async (req, res) => {
//     const {id} = req.params

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     const workout = await Workout.findOneAndDelete({_id: id})

//     if (!workout) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     res.status(200).json(workout)
// }

// // update a workout
// const updateWorkout = async (req, res) => {
//     const {id} = req.params

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     const workout = await Workout.findOneAndUpdate({_id: id}, {
//         ...req.body
//     })

//     if (!workout) {
//         return res.status(404).json({error: 'No such workout'})
//     }

//     res.status(200).json(workout)
// }

// module.exports = {
//     getWorkouts,
//     getWorkout,
//     createWorkout,
//     deleteWorkout,
//     updateWorkout
// }

const addWard = async (req, res) => {
    console.log("in addward")
    const ward = {
        name: "Cardiothoracic Ward",
        number: 1,
        shifts: ['633342d5b7cee2b016919f5e'],
        doctorCategories: ["Senior Registrar", "Registrar"],
        constraints: {
            maxLeaves: 4,
            numConsecutiveGroupShifts: 0,
            consecutiveGroups: [
                []
            ],
            specialShifts: [],
            casualtyDay: "Monday",
            casualtyDayShifts: ['633342d5b7cee2b016919f5e']
        },
        doctors: ['6333455ab7cee2b016919f60'],
        consultants: ['633346ffb7cee2b016919f62']
    } 

    try {
        const ward_created = await Ward.create(ward)
        res.status(200).json(ward_created)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

const addShift = async (req, res) => {
    console.log("addShifts")
    const shift = {
        name: "night",
        startTime: "19:00",
        endTime: "08:00",
    } 

    try {
        const ShiftCreated = await Shift.create(shift)
        res.status(200).json(ShiftCreated)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

const addLeave = async (req, res) => {
    console.log("addLeaves")
    const leave = {
        date: "2022-10-12",
        shift: ['633342d5b7cee2b016919f5e','633489c62018c4ed921a0852','63348a42457add832f5834c9'],         //ids of shifts
    } 

    try {
        const LeaveCreated = await Leave.create(leave)
        res.status(200).json(LeaveCreated)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

const addRequirement = async (req, res) => {
    console.log("addRequirement")
    const requirement = {
        doctor: "",         //id of doctor
        leaves: "",         //id of leave
    } 

    try {
        const RequirementCreated = await Requirement.create(requirement)
        res.status(200).json(RequirementCreated)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

const addShiftOfSchedule = async (req, res) => {
    console.log("addShiftOfSchedule")
    const requirement = {
        doctor: "id",       //id of doctor
        shift: ["id"]           //id of shift
    } 

    try {
        const ShiftOfScheduleCreated = await ShiftOfASchedule.create(requirement)
        res.status(200).json(ShiftOfScheduleCreated)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

const addSchedule = async (req, res) => {
    console.log("addSchedule")
    const requirement = {
        data: ['','',''],           //ids of shift of schedules
        dateTime: "2022-10-12",     
        ward: "",                   //id of ward
        status: "",                 //number
    } 

    try {
        const ScheduleCreated = await Schedule.create(requirement)
        res.status(200).json(ScheduleCreated)
    } catch (error) {
        console(error.message)
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    addWard,
    addShift,
    addLeave,
    addRequirement,
    addShiftOfSchedule,
    addSchedule
}