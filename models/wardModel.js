const mongoose = require('mongoose')

const Schema = mongoose.Schema

const wardSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    status: {
        type: Number
    },
    currentScheduleID : {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
    },
    shifts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shift'
        }
    ],
    doctorCategories: [ String ],
    constraints: {
        maxLeaves: {
            type: Number,
        },
        numConsecutiveGroupShifts: {
            type: Number
        },
        consecutiveGroups: [[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shift'
            }
        ]],
        specialShifts: [
            {
                shift: mongoose.Schema.Types.ObjectId,
                vacation: Number
            }
        ]
        // casualtyDay: String,
        // casualtyDayShifts: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Shift'
        // }]
    },
    
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    consultants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultant'
    }]
}, { timestamps: true })


module.exports = mongoose.model('Ward', wardSchema)