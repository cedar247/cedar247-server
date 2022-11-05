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
    // console.log(req.body);
    try{
        //checks for exitance of the email
    const user = await User.findOne({
        email:req.body.email
    })

    if (user){
        //if user exits the checks the password 
        if(bcrypt.compareSync(req.body.password, user.password)){
            //if password is correct then creats a jwt token
            if (user.type == "Admin"){
                const token = createToken(user._id,user.type)
                return res.status(200).json({status:"ok", userid : user,token:token})
            }
            else if (user.type == "DOCTOR"){
                const doctor = await Doctor.findOne({
                    userId:user._id
                })
                if(doctor){
                    console.log(doctor._id,doctor.userId,doctor.category);
                    const token = createToken(doctor._id,user.type)
                    return res.status(200).json({status:"ok", userid : user,token:token})
                }else{
                    return res.status(200).json({status:"Failed"})
                }
                
            }
            else if (user.type == "CONSULTANT"){
                const consultant = await Consultant.findOne({
                    userId:user._id
                })
                if(consultant){
                    const token = createToken(consultant._id,user.type)
                    return res.status(200).json({status:"ok", userid : user,token:token})
                }else{
                    return res.status(200).json({status:"Failed"})
                }
                
            }
            
            // return the token and other details
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