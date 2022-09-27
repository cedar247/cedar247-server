const Workout = require('../models/workoutModel')
const mongoose = require('mongoose')

const Ward = require('../models/wardModel')

// get all workouts
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

module.exports = {
    addWard
}