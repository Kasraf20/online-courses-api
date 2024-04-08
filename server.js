const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
require("dotenv").config();

const userRouter = require("./Routes/userRoute");
const courseRoute = require("./Routes/courseRoute")

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT;
app.get("/", (req, res) => {
  res.send("welcome to this website");
});


app.use("/user", userRouter);
app.use('/course',courseRoute)


app.listen(PORT, () => {
  console.log("app running fine");
});
