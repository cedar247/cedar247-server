const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leaveSchema = new Schema({
    date:{
        type : Date,
        required : true
    }
    ,
    shift:{
        type : Array,
        required : true
    }
    
},{timestamps : true})

module.exports = mongoose.model('leave',leaveSchema)
