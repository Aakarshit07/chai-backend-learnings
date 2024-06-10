import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname) // can also use uniqueSuffix fro unique filename
  }
})
  
export const upload = multer({ 
  storage 
  // in ES6 its same as below
  // storage: storage 
})
