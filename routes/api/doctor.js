const express = require('express')
const {
    getDoctors,
    getDoctor,
    createDoctor,
    deleteDoctor,
    updateDoctor,
} = require('../../controllers/doctorController')

const router = express.Router()

// GET all workouts
router.get("/", getDoctors);

// GET a single workout
router.get("/:id", getDoctor);

// POST a new workout
router.post("/", createDoctor);

// DELETE a workout
router.delete("/:id", deleteDoctor);

// UPDATE a workout
router.patch("/:id", updateDoctor);


module.exports = router