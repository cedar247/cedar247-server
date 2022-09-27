const request = require('request');

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

module.exports = {
  setDeadline
}