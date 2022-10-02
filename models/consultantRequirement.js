const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ConsultantRequirementSchema = new Schema({
    ShiftID:{
        type : Schema.Types.ObjectId,
        required : true
    }, 
    details: [
        {
            category: String,
            numOfDoctors: Number
        }
    ]    
},{timestamps : true})

module.exports = mongoose.model('consultantRequirement',ConsultantRequirementSchema)
