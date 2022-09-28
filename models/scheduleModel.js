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
        dateTime: {
            type: String,
            required: true,
        },
        ward: {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Ward',
            required: true,
        },
        status: {
            type: Number,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleModel);
