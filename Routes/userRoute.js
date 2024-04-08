const express = require("express");
const bcrypt = require("bcrypt");

const upload = require("../Middleware/uploadImage");
const cloudinary = require("../Utils/Cloudinary");
const User = require("../Models/userModel");
const Course = require("../Models/courseModel")
const { jwtAuthMiddleware, generateToken } = require("../Middleware/jwt");

const router = express.Router();
/************************Get All Users****************************** */
router.get("/", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});

/************************Registration****************************** */
router.post("/", upload.single("profileImage"), async (req, res) => {
  try {
    //Creating user
    const createUser = async (result) => {
      //Checking user role
      const userRole = req.body.role;
      //Check admin already exist or not
      if (userRole === "admin") {
        const foundAdmin = await User.find({ role: "admin" });
        if (foundAdmin.length > 0) {
          return res.json({ err: "admin already exists." });
        }
      }
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        image: result.url,
        role: req.body.role,
      });
      const savePerson = await newUser.save();
      //Generating JWT token
      const payload = {
        id: savePerson.id,
      };
      const token = generateToken(payload);
      res
        .status(200)
        .json({ user: newUser, token, message: "user created successfully." });
    };

    //if profile filed is empty.
    if (!req.file) {
      const result = {
        url: "http://res.cloudinary.com/de3gnee61/image/upload/v1712381609/n5ucjitwad89lzerku01.jpg",
      };
      createUser(result);
    } else {
      //Uploading image to cloudinary
      cloudinary.uploader.upload(req.file.path, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "error in cloudinary" });
        }
        createUser(result);
      });
    }
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/************************Login****************************** */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not exist" });
    bcrypt.compare(password, user.password, (err, data) => {
      if (err) throw err;

      //if hash password match
      if (data) {
        //Generating JWT token
        const payload = {
          id: user.id,
        };
        const token = generateToken(payload);
        return res.status(200).json({ user, token, msg: "Login success" });
      } else {
        return res.status(401).json({ msg: "Invalid credencial" });
      }
    });
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/************************Get Single User****************************** */
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await User.findById(userId);
    if (userData) res.json(userData);
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/************************Update User****************************** */
router.put("/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const updateData = await User.findByIdAndUpdate(id, data, {
      new: true,
    });
    res.status(200).json(updateData);
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/***********************Delete User****************************** */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ userDelete: deleteUser, message: "user deleted successfully." });
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});

/*********************User Enroll in new Course************************** */
router.post('/:courseId', jwtAuthMiddleware, async(req,res) => {
  //get user id from jwtAuthMiddleware
  const user = await User.findById(req.user.id);
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId)  
  
  try {
    if (user.userEnroll.includes(courseId)) {
      return res.json({ message: "user already enrolled in this course." });
    }

    course.enrolled+=1
    await course.save()
    user.userEnroll.push(courseId);
    await user.save();

    res.json({ message: "user enrolled successfully." });
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
})


/*********************User all Courses************************** */
router.get('/:userId/courses', jwtAuthMiddleware ,async (req,res) => {
  try{
    //get user id from params
    const user = await User.findById(req.params.userId);
    if(user.userEnroll.length === 0) return res.status(200).json({message : 'user not enrolled in any courses.'})
    res.status(200).json(user.userEnroll)
  }catch(err){
    res.status(500).json({message : 'internal server error.'})
  }
})


module.exports = router;
