const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requirementModel = new Schema(
    {
        doctor: {
            type: mongoose.Schema.type.ObjectId,
            ref: 'Doctor',
            required: true
        },
        leaves: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'leave',
                required:true
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementModel);
