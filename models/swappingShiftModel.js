const mongoose = require('mongoose')

const Schema = mongoose.Schema

const swappingShiftSchema = new Schema({
    fromShiftofSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },    
    toShiftofSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    fromDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    toDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ward:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ward',
        required: true,
    },
    status: {
        type: Number,
        required: true,
    }
}, { timestamps: true })


module.exports = mongoose.model('SwappingShifts', swappingShiftSchema)