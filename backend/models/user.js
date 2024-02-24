const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
   name: {
      type: String,
      required: true
   },
   name1: {
      type: String,
      required: true
   },
   password1: {
      type: String,  // Array of numbers for x and y coordinates
      required: true
   },
   password: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true,
      unique: true
   },
   date: {
      type: Date,
      default: Date.now
   }
})
module.exports = mongoose.model('user', userSchema)