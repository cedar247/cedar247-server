const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shiftModel = new Schema(
    {
        startTime: "String",
        endTime: "String",

    },
    { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftModel);
