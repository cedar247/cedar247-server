const mongoose = require("mongoose");
const Leave = require('./Leave');
const Doctor = require('./Doctor');

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
