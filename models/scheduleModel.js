const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scheduleModel = new Schema(
    {
        data: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref : 'ShiftOfASchedule',
            }
        ],

        year: Number,
        month: Number,
        deadline: {
            type: String
        },
        ward: {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Ward',
            required: true,
        },

        doctorRequirements: [ mongoose.Schema.Types.ObjectId ],
        consultantRequirements: [ mongoose.Schema.Types.ObjectId ],
        status: {
            type: Number,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleModel);
