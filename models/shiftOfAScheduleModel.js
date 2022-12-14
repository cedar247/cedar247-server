const mongoose = require('mongoose')

const Schema = mongoose.Schema

const shiftOfAScheduleSchema = new Schema({
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }],
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    ward:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ward',
        required: true
    },
}, { timestamps: true })


module.exports = mongoose.model('ShiftOfASchedule', shiftOfAScheduleSchema)