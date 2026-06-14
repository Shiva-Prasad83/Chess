const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

//Setup Cloudinary account to store profile-images in cloud
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Where & How to Store
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile-pics",
        format: async (req, file) => {
            let extArray = file.originalname.split("."); // profile.images.jpeg
            let extension = extArray[extArray.length - 1]; // [profile, images, jpeg]
            return extension;
        },
    },
});

/*User uploads file
       ↓
  fileFilter runs         ← const parser handles this
  "is it an image?"
       ↓
   YES → proceed
   NO  → throw error
       ↓
  storage kicks in        ← const storage handles this
  "save to cloudinary
   in profile-pics
   folder as jpeg"*/

//Validation Before Upload
const parser = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        let extArray = file.originalname.split("."); // originalName -> profile.images.jpeg -> extArray -> [profile...]
        let extension = extArray[extArray.length - 1]; // jpeg
        let allowedExt = ["png", "jpg", "jpeg"];
        if (!allowedExt.includes(extension)) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
    },
});

module.exports = parser;



// const multer = require('multer');
// const path = require('path');
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, 'uploads'));
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${file.originalname}-${Date.now()}`);
//     }
// })

// const upload = multer({
//     storage: storage
// })

// module.exports = upload;