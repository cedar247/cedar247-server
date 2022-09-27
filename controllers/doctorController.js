const Doctor = require("../models/doctorModel");
const mongoose = require("mongoose");

// get all doctor
const getDoctors = async (req, res) => {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });

    res.status(200).json(doctors);
};

// get a single doctor
const getDoctor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such doctor" });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
        return res.status(404).json({ error: "No such doctor" });
    }

    res.status(200).json(doctor);
};

// create a new doctor
const createDoctor = async (req, res) => {
    const { name, phoneNumber, email, category, WardID } = req.body;

    let emptyFields = [];

    if (!name) {
        emptyFields.push("name");
    }
    if (!phoneNumber) {
        emptyFields.push("phoneNumber");
    }
    if (!email) {
        emptyFields.push("email");
    }
    if (!category) {
        emptyFields.push("category");
    }
    if (!WardID) {
        emptyFields.push("WardID");
    }
    if (emptyFields.length > 0) {
        return res
            .status(400)
            .json({ error: "Please fill in all fields", emptyFields });
    }

    // add to the database
    try {
        const doctor = await Doctor.create({ name, phoneNumber, email, category, WardID });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// delete a doctor
const deleteDoctor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "No such doctor" });
    }

    const doctor = await Doctor.findOneAndDelete({ _id: id });

    if (!doctor) {
        return res.status(400).json({ error: "No such doctor" });
    }

    res.status(200).json(doctor);
};

// update a doctor
const updateDoctor = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "No such doctor" });
    }

    const doctor = await Doctor.findOneAndUpdate({ _id: id },{...req.body,});

    if (!doctor) {
        return res.status(400).json({ error: "No such doctor" });
    }

    res.status(200).json(doctor);
};

module.exports = {
    getDoctors,
    getDoctor,
    createDoctor,
    deleteDoctor,
    updateDoctor,
};
