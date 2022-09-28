const defineRequirements = async (req, res) => {
    console.log("data recieved");
    const data = req.body;

    console.log(data);

};

const changeClendar = async (req, res) => {
    console.log("data recieved");
    const data = req.body;

    console.log(data);
    res.status(200).json([])

}

const changePassword = async (req, res) => {
    console.log("data recieved");
    const data = req.body;

    console.log(data);

};

module.exports = {
    defineRequirements,
    changeClendar,
    changePassword
};
