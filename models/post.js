const mongoose = require('mongoose') ;

const PostSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId ,
        ref : "user"
    },
    date : {
        type : Date ,
        default : Date.now
    },
    projectTitle : String ,
    budget : Number ,
    content : String ,
    deadline: {
        type: Date,  // Define the deadline as a Date type
        required: true  // Make it required, as per your form field
    },
}) ;

module.exports = mongoose.model("post" , PostSchema) ;