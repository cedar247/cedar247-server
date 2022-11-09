const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ConsultantRequirementSchema = new Schema({
    shiftId:{
        type : Schema.Types.ObjectId,
        required : true
    }, 
    seniorRegistrar: Number,
    registrar: Number,
    seniorHomeOfficer: Number,
    homeOfficer: Number,
    medicalOfficer: Number   
},{timestamps : true})

module.exports = mongoose.model('consultantRequirement',ConsultantRequirementSchema)
