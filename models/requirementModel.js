const mongoose = require("mongoose");
const Leave = require('./leaveModel');
const Doctor = require('./doctorModel');

const Schema = mongoose.Schema;

const requirementModel = new Schema(
    {
        doctor: {
            type: mongoose.Schema.type.ObjectId,
            ref: Doctor,
            required: true
        },
        leaves: [Leave],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementModel);
