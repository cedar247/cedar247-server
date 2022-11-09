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
router.post('/addWard', addWard)
router.post('/addShift', addShift)
router.post('/addLeave', addLeave)
router.post('/addRequirement', addRequirement)
router.post('/addShiftOfSchedule', addShiftOfSchedule)
router.post('/addSchedule', addSchedule)





// router.get('/', getWorkouts)


// // GET a single workout
// router.get('/:id', getWorkout)

// POST a new workout
// router.get('/', getWorkouts)


// // GET a single workout
// router.get('/:id', getWorkout)

// // POST a new workout

// router.post('/', createWorkout)

// // DELETE a workout
// router.delete('/:id', deleteWorkout)

// // UPDATE a workout
// router.patch('/:id', updateWorkout)


router.get('/add-ward', addWard)

module.exports = router