const express = require('express')
const {
    addWard
} = require('../controllers/workoutController')

const router = express.Router()

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