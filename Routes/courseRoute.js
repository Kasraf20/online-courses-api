const express = require("express");

const Course = require("../Models/courseModel");
const User = require("../Models/userModel");
const upload = require("../Middleware/uploadImage");
const cloudinary = require("../Utils/Cloudinary");
const { jwtAuthMiddleware } = require("../Middleware/jwt");

const router = express.Router();
/***************************Get All Courses*************************** */
router.get("/", async (req, res) => {
  try {
    const data = await Course.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


const checkAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};


/**************************Add new Course*************************** */
router.post(
  "/",
  upload.single("courseImage"),
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      //check user role
      if (!(await checkAdmin(req.user.id))) {
        return res.json({ err: "user has no admin role" });
      }
      //upload course image
      cloudinary.uploader.upload(req.file.path, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "error in cloudinary" });
        }
        creatCourse(result);
      });

      const creatCourse = async (result) => {
        const newCourse = new Course({
          name: req.body.name,
          category: req.body.category,
          level:req.body.level,
          description: req.body.description,
          image: result.url,
          price: req.body.price,
        });
        const saveCourse = await newCourse.save();
        res.status(200).json({course: newCourse, message: "Courses created successfully."});
      };
    } catch (err) {
        res.status(500).json({message : 'internal server error'})
    }
  }
);


/**************************Update Course*************************** */
router.put("/:courseId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id))) {
      return res.json({ err: "user has no admin role" });
    }
    const courseId = req.params.courseId;
    const updatedData = req.body;
    const courseData = await Course.findByIdAndUpdate(
      courseId,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(courseData);
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/**************************Delete Candidate*************************** */
router.delete("/:courseId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id))) {
      return res.json({ err: "user has no admin role" });
    }
    const id = req.params.courseId;
    const deleteUser = await Course.findByIdAndDelete(id);
    res.json({ courseDelete: deleteUser, message: "user deleted successfully." });
  } catch (err) {
    res.status(500).json({message : 'internal server error'})
  }
});


/**************************Filtering api*************************** */
router.get('/filter', async(req,res) => {
  try{
    const queryObject = {}
    if(req.query.category){
      queryObject.category = req.query.category
    }
    if(req.query.level){
      queryObject.level = req.query.level
    }
    const data = await Course.find(queryObject)
    res.status(200).json(data)
  }catch(err){
    res.status(500).json({message : 'internal server error'})
  }
})


/**************************Serching api*************************** */
router.get('/search/:key', async (req,res) => {
  try{
    const data = await Course.find(
      {
        "$or" : [
          {'name' : {$regex:req.params.key,$options:"i"}},
          {'category' : {$regex:req.params.key,$options:'i'}}
        ]
      }
    )
    res.status(200).json(data)
  }catch(err){
    res.status(500).json({message : 'internal server error'})
  }
})


/**************************Paggination api*************************** */
router.get('/paggination', async (req,res) => {
  try{
    let limit = Number(req.query.limit) || 3
    let page = Number(req.query.page) || 1

    let skip = (page-1) * limit
    const data = await Course.find().skip(skip).limit(limit)
    res.status(200).json(data)
  }catch(err){
    res.status(500).json({message : 'internal server error'})
  }
})


module.exports = router;
