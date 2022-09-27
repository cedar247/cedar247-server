const defineRequirements = async (req, res) => {
    console.log("got data");
    const data = req.body;

    console.log(data);
    // add doc to database
    // try {
    //     const workout = await Workout.create({title, load, reps})
    //     res.status(200).json(workout)
    // } catch (error) {
    //     res.status(400).json({error: error.message})
    // }
    // res.json({msg: 'POST a new workout'})
};

module.exports = {
    defineRequirements,
};
