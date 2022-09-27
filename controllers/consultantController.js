const request = require('request');
const Doctor = require('../models/doctorModel')
const Ward = require('../models/wardModel')
const mongoose = require('mongoose')

const createSchedule = async (req, res) => {
    request('http://127.0.0.1:5000/schedule', function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the data received
        res.send(body); //Display the response on the website
      }); 
}

const setDeadline = async (req, res) => {
  console.log("got data")
  const data = req.body

  console.log(data)
  // add doc to database
  // try {
  //     const workout = await Workout.create({title, load, reps})
  //     res.status(200).json(workout)
  // } catch (error) {
  //     res.status(400).json({error: error.message})
  // }
  // res.json({msg: 'POST a new workout'})
}

const getDoctors = async (req, res) => {
  const filter = {}; // filter must be {ward:_id} id must be given
  const doctors = await Doctor.find(filter);
  const newDoctors = [];


  for(let i = 0; i < doctors.length; i++) {
    const ward = await Ward.findById(doctors[i]["WardID"]);
    
      doctors[i]["wardName"] = ward.name;
      doctors[i]["wardNumber"] = ward.number;
      newDoctors.push(
        {
          _id: doctors[i]["_id"],
          name: doctors[i]["name"],
          phoneNumber: doctors[i]["phoneNumber"],
          email: doctors[i]["email"],
          category: doctors[i]["category"],
          WardID: doctors[i]["WardID"],
          "wardName": ward.name,
          "wardNumber": ward.number
        }
      )
  }

  res.status(200).json(newDoctors);
}

module.exports = {
  setDeadline,
  createSchedule,
  getDoctors
}