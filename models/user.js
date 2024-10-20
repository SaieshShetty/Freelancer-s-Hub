const mongoose = require('mongoose') ;
mongoose.connect(`mongodb://127.0.0.1:27017/freelancer`)


const UserSchema = mongoose.Schema({
    username : String ,
    email : String ,
    password : String ,
    Age : Number ,
    Phno : Number ,
    accountType : String ,
    profilePhoto : {
        type : String ,
        default : "default.png"
    },
    posts : [{ type: mongoose.Schema.Types.ObjectId, ref:"post"}],
    reviews : [{ type: mongoose.Schema.Types.ObjectId, ref:"review"}]
}) ;

module.exports = mongoose.model("user" , UserSchema) ; 