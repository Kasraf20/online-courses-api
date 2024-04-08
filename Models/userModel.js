const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  userEnroll : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required : true
    }
  ]
});

//Hashing password before saving into database.
userSchema.pre('save', async function (next){
  try{
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    next()
  }catch(err){
    next(err)
  }
})

const User = mongoose.model("User", userSchema);
module.exports = User;
