const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ConsultantSchema = new Schema({
    name:{
        type : String,
        required : true
    }
    ,
    phoneNumber:{
        type : String,
        required : true
    }
    ,
    email:{
        type : String,
        required : true
    }
    ,
    WardID:{
        type : Schema.Types.ObjectId,
        required : true
    }
    ,
    userId:{
        type : Schema.Types.ObjectId,
        ref: 'users',
        required : true
    }

},{timestamps : true})
module.exports = mongoose.model('consultant',ConsultantSchema)
