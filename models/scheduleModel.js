const mongoose = require("mongoose");
const ShiftOfASchedule = require('./shiftOfAScheduleModel')
const Ward = require('./Ward')

const Schema = mongoose.Schema;

const scheduleModel = new Schema(
    {
        data: [ShiftOfASchedule],
        dateTime: {
            type: date,
            required: true,
        }
        ward: {
            type: Ward,
            required: true,
        }
        status: {
            type: Number,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleModel);
