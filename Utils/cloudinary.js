const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  // cloud_name: "de3gnee61",
  // api_key: "726185596168511",
  // api_secret: "SLeYuoBp1bVyZgWuIXsClKucLgQ",
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

module.exports = cloudinary
