const multer = require('multer') ;
const crypto = require('crypto') ;
const path = require('path') ;

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/imag/uploads') ;
    },
    filename : function(req,file,cb){
        crypto.randomBytes(24,(err,data) =>{
            const fn = data.toString("hex")+path.extname(file.originalname) ;
            cb(null,fn) ;
        })
    }
})

const upload = multer({storage:storage}) ;

module.exports = upload ;