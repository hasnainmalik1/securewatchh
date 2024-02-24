const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1/securewatch-user";

const connectToMongo = () => {
    mongoose.connect(mongoURI);
    console.log("dfdsf")
}

module.exports = connectToMongo;
