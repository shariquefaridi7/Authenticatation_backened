import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    }
},{timestamps:true});

userSchema.methods.generateJWT=function(){
    const token=jwt.sign({
        _id:this._id,
        email:this.email
    },process.env.JWT_SECRET_KEY,{expiresIn:"7d"});

    return token;
}

const UserEmail=mongoose.model("UserEmail",userSchema);

export default UserEmail;