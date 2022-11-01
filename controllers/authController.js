const Consultant = require('../models/consultantModel')
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const Shift = require('../models/shiftModel')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

// function to create the token
const createToken = (_id,type) =>{
    return jwt.sign({_id,type},process.env.SECRET,{expiresIn:'2d'})
}
// function to do a user login
const doLogin = async (req,res)=>{
    console.log(req.body);
    try{
        //checks for exitance of the email
    const user = await User.findOne({
        email:req.body.email
    })

    if (user){
        //if user exits the checks the password 
        if(bcrypt.compareSync(req.body.password, user.password)){
            //if password is correct then creats a jwt token
            const token = createToken(user._id,user.type)
            console.log(user._id,user.type);
            // return the token and other details
        return res.status(200).json({status:"ok", userid : user,token:token})
        }
        
        
    }else{
        // if fails sends failed message
        return res.status(200).json({status:"Failed"})
    }

    // res.status(200).json(consultant)
    }catch(error){
        // if fails sends error message
       return res.status(400).json(error)
    }
    // if fails sends failed message
    return res.status(200).json({status:"Failed"})

}
module.exports =  {
    doLogin

}