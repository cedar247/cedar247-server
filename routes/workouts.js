const express = require('express')
const {
    addWard,
    addShift,
    addLeave,
    addRequirement,
    addShiftOfSchedule,
    addSchedule
} = require('../controllers/workoutController')

const router = express.Router()

//add a new ward
router.post('/', addWard)




// router.get('/', getWorkouts)


// // GET a single workout
// router.get('/:id', getWorkout)

// POST a new workout
// router.post('/', createWorkout)

// // DELETE a workout
// router.delete('/:id', deleteWorkout)

// // UPDATE a workout
// router.patch('/:id', updateWorkout)

module.exports = router