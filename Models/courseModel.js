const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required:true
  },
  level:{
    type:String,
    required:true
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true
  },
  price : {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default : 0
  },
  enrolled: {
    type: Number,
    default: 0
  }
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
