const mongoose = require('mongoose') ;

const ReviewSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId ,
        ref : "user", 
        required : true
    },
    programmingLanguage : {
        type : String ,
        required : true
    },
    rating : {
        type : Number ,
        min : 1 ,
        max : 5 ,
        required : true
    },
    review : {
        type : String ,
        required : true
    }
}) ;

module.exports = mongoose.model('Review' , ReviewSchema) ; 