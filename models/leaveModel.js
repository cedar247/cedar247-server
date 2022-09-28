const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leaveSchema = new Schema({
    date:{
        type : String,
        required : true
    }
    ,
    shift:{
        type : Array,
        ref : 'Shift'
        required : true
    }
    
},{timestamps : true})

module.exports = mongoose.model('leave',leaveSchema)
