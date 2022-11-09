const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leaveSchema = new Schema({
    date:{
        type : String,
        required : true
    }
    ,
    shift:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Shift',
        required : true
    }]
    
},{timestamps : true})

module.exports = mongoose.model('leave',leaveSchema)
